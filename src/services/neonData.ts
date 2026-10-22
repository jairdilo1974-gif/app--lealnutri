import { neon } from '@neondatabase/serverless'

/**
 * Safely converts a Date object or ISO date string to 'YYYY-MM-DD' format.
 * The Neon driver returns PostgreSQL `date` columns as JavaScript Date objects.
 * Using String(dateObj) gives locale format (e.g. 'Wed Sep 20 2000...') which breaks
 * the split('T')[0] pattern. This helper handles both Date objects and strings correctly.
 */
function toDateStr(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }
  const s = String(value)
  // If it's an ISO string like '2000-09-20T03:00:00.000Z'
  if (s.includes('T')) {
    return s.split('T')[0]
  }
  return s
}

export interface PatientWithoutReturn {
  id: string
  nome: string
  telefone?: string
  whatsapp?: string
  email?: string
  ultima_consulta: string
  proximo_retorno: string | null
  dias_sem_consulta: number
}

export interface DashboardStats {
  totalPacientes: number
  consultasSemana: number
  pacientesSemRetorno: PatientWithoutReturn[]
}

export interface Patient {
  id: string
  nutricionista_id: string
  nome: string
  email?: string
  telefone?: string
  whatsapp?: string
  data_nascimento?: string
  sexo?: string
  peso_inicial?: number
  altura?: number
  imc?: number
  objetivos?: string[]
  objetivo_texto?: string
  nivel_atividade?: string
  patologias?: string[]
  restricoes_alimentares?: string[]
  alergias?: string[]
  medicamentos?: string
  suplementos?: string
  refeicoes_por_dia?: number
  horario_acorda?: string
  horario_dorme?: string
  litros_agua?: number
  atividade_fisica?: boolean
  atividade_fisica_descricao?: string
  observacoes?: string
  created_at: string
  ultima_consulta?: string | null
}

export interface Consultation {
  id: string
  paciente_id: string
  data_consulta: string
  peso?: number
  cintura?: number
  quadril?: number
  percentual_gordura?: number
  proximo_retorno?: string | null
  observacoes?: string
  created_at: string
}

export interface MealPlan {
  id: string
  paciente_id: string
  conteudo: any
  created_at: string
}

export interface PatientDetail extends Patient {
  consultas: Consultation[]
  planos_alimentares: MealPlan[]
}

export class NeonDataService {
  private static getSql() {
    const dbUrl = import.meta.env.VITE_NEON_DATABASE_URL
    if (!dbUrl) {
      throw new Error('VITE_NEON_DATABASE_URL não está configurada no arquivo .env')
    }
    return neon(dbUrl)
  }

  /**
   * Garante o UUID correspondente da nutricionista na tabela public.nutricionistas
   */
  static async resolveNutricionistaId(userId: string, email: string): Promise<string> {
    try {
      const sql = this.getSql()
      const rows = await sql`
        SELECT id FROM public.nutricionistas 
        WHERE id = ${userId} OR email = ${email}
        LIMIT 1
      `
      if (rows && rows.length > 0) {
        return rows[0].id
      }

      // Se ainda não estiver inserido, insere e retorna
      const inserted = await sql`
        INSERT INTO public.nutricionistas (id, nome, email, created_at)
        VALUES (${userId}, ${email.split('@')[0]}, ${email}, NOW())
        ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id
        RETURNING id
      `
      return inserted[0].id
    } catch (err) {
      console.warn('Aviso ao resolver nutricionista_id no Neon:', err)
      return userId
    }
  }

  /**
   * Regras do Prompt 3:
   * Card 1 — Total de pacientes ativos (cadastrados pela nutricionista logada)
   * Card 2 — Consultas da semana (registradas na semana atual)
   * Card 3 — Pacientes sem retorno (última consulta > 30 dias e sem próximo retorno agendado)
   */
  static async getDashboardStats(nutriId: string): Promise<DashboardStats> {
    const sql = this.getSql()

    // 1. Total de pacientes cadastrados pela nutricionista
    const totalPacientesRes = await sql`
      SELECT COUNT(*)::int AS total 
      FROM public.pacientes 
      WHERE nutricionista_id = ${nutriId}
    `
    const totalPacientes = totalPacientesRes[0]?.total || 0

    // 2. Consultas da semana atual (da segunda ao domingo corrente)
    const consultasSemanaRes = await sql`
      SELECT COUNT(*)::int AS total
      FROM public.consultas c
      JOIN public.pacientes p ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutriId}
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)::date
        AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date
    `
    const consultasSemana = consultasSemanaRes[0]?.total || 0

    // 3. Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
    const semRetornoRes = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          p.id,
          p.nome,
          p.telefone,
          p.whatsapp,
          p.email,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno
        FROM public.pacientes p
        JOIN public.consultas c ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutriId}
        GROUP BY p.id, p.nome, p.telefone, p.whatsapp, p.email
      )
      SELECT 
        id,
        nome,
        telefone,
        whatsapp,
        email,
        ultima_consulta,
        proximo_retorno,
        (CURRENT_DATE - ultima_consulta)::int AS dias_sem_consulta
      FROM ultimas_consultas
      WHERE ultima_consulta < CURRENT_DATE - INTERVAL '30 days'
        AND (proximo_retorno IS NULL OR proximo_retorno < CURRENT_DATE)
      ORDER BY ultima_consulta ASC
    `

    const pacientesSemRetorno: PatientWithoutReturn[] = (semRetornoRes || []).map((row: any) => ({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone || undefined,
      whatsapp: row.whatsapp || undefined,
      email: row.email || undefined,
      ultima_consulta: row.ultima_consulta,
      proximo_retorno: row.proximo_retorno || null,
      dias_sem_consulta: Number(row.dias_sem_consulta) || 0,
    }))

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno,
    }
  }

  /**
   * Lista todos os pacientes cadastrados pela nutricionista com a data da última consulta
   */
  static async getPatients(nutriId: string): Promise<Patient[]> {
    const sql = this.getSql()
    const rows = await sql`
      SELECT 
        p.id,
        p.nutricionista_id,
        p.nome,
        p.email,
        p.telefone,
        p.whatsapp,
        p.data_nascimento,
        p.sexo,
        p.peso_inicial,
        p.altura,
        p.objetivos,
        p.objetivo_texto,
        p.nivel_atividade,
        p.patologias,
        p.restricoes_alimentares,
        p.alergias,
        p.medicamentos,
        p.suplementos,
        p.refeicoes_por_dia,
        p.horario_acorda,
        p.horario_dorme,
        p.litros_agua,
        p.atividade_fisica,
        p.atividade_fisica_descricao,
        p.observacoes,
        p.created_at,
        MAX(c.data_consulta) AS ultima_consulta
      FROM public.pacientes p
      LEFT JOIN public.consultas c ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutriId}
      GROUP BY 
        p.id,
        p.nutricionista_id,
        p.nome,
        p.email,
        p.telefone,
        p.whatsapp,
        p.data_nascimento,
        p.sexo,
        p.peso_inicial,
        p.altura,
        p.objetivos,
        p.objetivo_texto,
        p.nivel_atividade,
        p.patologias,
        p.restricoes_alimentares,
        p.alergias,
        p.medicamentos,
        p.suplementos,
        p.refeicoes_por_dia,
        p.horario_acorda,
        p.horario_dorme,
        p.litros_agua,
        p.atividade_fisica,
        p.atividade_fisica_descricao,
        p.observacoes,
        p.created_at
      ORDER BY p.created_at DESC
    `

    return (rows || []).map((r: any) => ({
      id: r.id,
      nutricionista_id: r.nutricionista_id,
      nome: r.nome,
      email: r.email || undefined,
      telefone: r.telefone || undefined,
      whatsapp: r.whatsapp || undefined,
      data_nascimento: r.data_nascimento ? toDateStr(r.data_nascimento) : undefined,
      sexo: r.sexo || undefined,
      peso_inicial: r.peso_inicial ? Number(r.peso_inicial) : undefined,
      altura: r.altura ? Number(r.altura) : undefined,
      objetivos: r.objetivos || [],
      objetivo_texto: r.objetivo_texto || undefined,
      nivel_atividade: r.nivel_atividade || undefined,
      patologias: r.patologias || [],
      restricoes_alimentares: r.restricoes_alimentares || [],
      alergias: r.alergias || [],
      medicamentos: r.medicamentos || undefined,
      suplementos: r.suplementos || undefined,
      refeicoes_por_dia: r.refeicoes_por_dia ? Number(r.refeicoes_por_dia) : undefined,
      horario_acorda: r.horario_acorda || undefined,
      horario_dorme: r.horario_dorme || undefined,
      litros_agua: r.litros_agua ? Number(r.litros_agua) : undefined,
      atividade_fisica: r.atividade_fisica === true,
      atividade_fisica_descricao: r.atividade_fisica_descricao || undefined,
      observacoes: r.observacoes || undefined,
      created_at: r.created_at,
      ultima_consulta: r.ultima_consulta ? toDateStr(r.ultima_consulta) : null,
    }))
  }

  /**
   * Obtém os dados completos de um paciente e todo o seu histórico de consultas
   */
  static async getPatientProfile(patientId: string, nutriId: string): Promise<PatientDetail | null> {
    const sql = this.getSql()
    const patientRows = await sql`
      SELECT * FROM public.pacientes
      WHERE id = ${patientId} AND nutricionista_id = ${nutriId}
      LIMIT 1
    `
    if (!patientRows || patientRows.length === 0) return null

    const p = patientRows[0] as any
    const consultasRows = await sql`
      SELECT * FROM public.consultas
      WHERE paciente_id = ${patientId}
      ORDER BY data_consulta DESC
    `

    let planosRows: any[] = []
    try {
      planosRows = await sql`
        SELECT * FROM public.planos_alimentares
        WHERE paciente_id = ${patientId}
        ORDER BY created_at DESC
      `
    } catch (e) {
      console.warn('Tabela planos_alimentares ainda sem registros ou erro:', e)
    }

    return {
      id: p.id,
      nutricionista_id: p.nutricionista_id,
      nome: p.nome,
      email: p.email || undefined,
      telefone: p.telefone || undefined,
      whatsapp: p.whatsapp || undefined,
      data_nascimento: p.data_nascimento ? toDateStr(p.data_nascimento) : undefined,
      sexo: p.sexo || undefined,
      peso_inicial: p.peso_inicial ? Number(p.peso_inicial) : undefined,
      altura: p.altura ? Number(p.altura) : undefined,
      objetivos: p.objetivos || [],
      objetivo_texto: p.objetivo_texto || undefined,
      nivel_atividade: p.nivel_atividade || undefined,
      patologias: p.patologias || [],
      restricoes_alimentares: p.restricoes_alimentares || [],
      alergias: p.alergias || [],
      medicamentos: p.medicamentos || undefined,
      suplementos: p.suplementos || undefined,
      refeicoes_por_dia: p.refeicoes_por_dia ? Number(p.refeicoes_por_dia) : undefined,
      horario_acorda: p.horario_acorda || undefined,
      horario_dorme: p.horario_dorme || undefined,
      litros_agua: p.litros_agua ? Number(p.litros_agua) : undefined,
      atividade_fisica: p.atividade_fisica === true,
      atividade_fisica_descricao: p.atividade_fisica_descricao || undefined,
      observacoes: p.observacoes || undefined,
      created_at: p.created_at,
      consultas: (consultasRows || []).map((c: any) => ({
        id: c.id,
        paciente_id: c.paciente_id,
        data_consulta: c.data_consulta ? toDateStr(c.data_consulta) : '',
        peso: c.peso ? Number(c.peso) : undefined,
        cintura: c.cintura ? Number(c.cintura) : undefined,
        quadril: c.quadril ? Number(c.quadril) : undefined,
        percentual_gordura: c.percentual_gordura ? Number(c.percentual_gordura) : undefined,
        proximo_retorno: c.proximo_retorno ? toDateStr(c.proximo_retorno) : null,
        observacoes: c.observacoes || undefined,
        created_at: c.created_at,
      })),
      planos_alimentares: (planosRows || []).map((pl: any) => ({
        id: pl.id,
        paciente_id: pl.paciente_id,
        conteudo: pl.conteudo,
        created_at: pl.created_at,
      })),
    }
  }

  /**
   * Cadastra um novo paciente no banco de dados Neon com todos os dados clínicos e de hábitos
   */
  static async createPatient(
    nutriId: string,
    data: {
      nome: string
      email?: string
      telefone?: string
      whatsapp?: string
      data_nascimento?: string
      sexo?: string
      peso_inicial?: number
      altura?: number
      objetivos?: string[]
      objetivo_texto?: string
      nivel_atividade?: string
      patologias?: string[]
      restricoes_alimentares?: string[]
      alergias?: string[]
      medicamentos?: string
      suplementos?: string
      refeicoes_por_dia?: number
      horario_acorda?: string
      horario_dorme?: string
      litros_agua?: number
      atividade_fisica?: boolean
      atividade_fisica_descricao?: string
      observacoes?: string
    }
  ): Promise<Patient> {
    const sql = this.getSql()
    const rows = await sql`
      INSERT INTO public.pacientes (
        nutricionista_id,
        nome,
        email,
        telefone,
        whatsapp,
        data_nascimento,
        sexo,
        peso_inicial,
        altura,
        objetivos,
        objetivo_texto,
        nivel_atividade,
        patologias,
        restricoes_alimentares,
        alergias,
        medicamentos,
        suplementos,
        refeicoes_por_dia,
        horario_acorda,
        horario_dorme,
        litros_agua,
        atividade_fisica,
        atividade_fisica_descricao,
        observacoes,
        created_at
      ) VALUES (
        ${nutriId},
        ${data.nome.trim()},
        ${data.email?.trim() || null},
        ${data.telefone?.trim() || null},
        ${data.whatsapp?.trim() || null},
        ${data.data_nascimento || null},
        ${data.sexo || null},
        ${data.peso_inicial != null && !isNaN(data.peso_inicial) ? data.peso_inicial : null},
        ${data.altura != null && !isNaN(data.altura) ? data.altura : null},
        ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : []},
        ${data.objetivo_texto?.trim() || null},
        ${data.nivel_atividade || null},
        ${data.patologias && data.patologias.length > 0 ? data.patologias : []},
        ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : []},
        ${data.alergias && data.alergias.length > 0 ? data.alergias : []},
        ${data.medicamentos?.trim() || null},
        ${data.suplementos?.trim() || null},
        ${data.refeicoes_por_dia != null && !isNaN(data.refeicoes_por_dia) ? data.refeicoes_por_dia : null},
        ${data.horario_acorda?.trim() || null},
        ${data.horario_dorme?.trim() || null},
        ${data.litros_agua != null && !isNaN(data.litros_agua) ? data.litros_agua : null},
        ${data.atividade_fisica === true},
        ${data.atividade_fisica_descricao?.trim() || null},
        ${data.observacoes?.trim() || null},
        NOW()
      )
      RETURNING *
    `

    const r = rows[0] as any
    return {
      id: r.id,
      nutricionista_id: r.nutricionista_id,
      nome: r.nome,
      email: r.email || undefined,
      telefone: r.telefone || undefined,
      whatsapp: r.whatsapp || undefined,
      data_nascimento: r.data_nascimento ? toDateStr(r.data_nascimento) : undefined,
      sexo: r.sexo || undefined,
      peso_inicial: r.peso_inicial ? Number(r.peso_inicial) : undefined,
      altura: r.altura ? Number(r.altura) : undefined,
      objetivos: r.objetivos || [],
      objetivo_texto: r.objetivo_texto || undefined,
      nivel_atividade: r.nivel_atividade || undefined,
      patologias: r.patologias || [],
      restricoes_alimentares: r.restricoes_alimentares || [],
      alergias: r.alergias || [],
      medicamentos: r.medicamentos || undefined,
      suplementos: r.suplementos || undefined,
      refeicoes_por_dia: r.refeicoes_por_dia ? Number(r.refeicoes_por_dia) : undefined,
      horario_acorda: r.horario_acorda || undefined,
      horario_dorme: r.horario_dorme || undefined,
      litros_agua: r.litros_agua ? Number(r.litros_agua) : undefined,
      atividade_fisica: r.atividade_fisica === true,
      atividade_fisica_descricao: r.atividade_fisica_descricao || undefined,
      observacoes: r.observacoes || undefined,
      created_at: r.created_at,
      ultima_consulta: null,
    }
  }

  /**
   * Atualiza a ficha de cadastro completa de um paciente existente no banco Neon
   */
  static async updatePatient(
    patientId: string,
    nutriId: string,
    data: {
      nome: string
      email?: string
      telefone?: string
      whatsapp?: string
      data_nascimento?: string
      sexo?: string
      peso_inicial?: number
      altura?: number
      objetivos?: string[]
      objetivo_texto?: string
      nivel_atividade?: string
      patologias?: string[]
      restricoes_alimentares?: string[]
      alergias?: string[]
      medicamentos?: string
      suplementos?: string
      refeicoes_por_dia?: number
      horario_acorda?: string
      horario_dorme?: string
      litros_agua?: number
      atividade_fisica?: boolean
      atividade_fisica_descricao?: string
      observacoes?: string
    }
  ): Promise<Patient> {
    const sql = this.getSql()
    const rows = await sql`
      UPDATE public.pacientes SET
        nome = ${data.nome.trim()},
        email = ${data.email?.trim() || null},
        telefone = ${data.telefone?.trim() || null},
        whatsapp = ${data.whatsapp?.trim() || null},
        data_nascimento = ${data.data_nascimento || null},
        sexo = ${data.sexo || null},
        peso_inicial = ${data.peso_inicial != null && !isNaN(data.peso_inicial) ? data.peso_inicial : null},
        altura = ${data.altura != null && !isNaN(data.altura) ? data.altura : null},
        objetivos = ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : []},
        objetivo_texto = ${data.objetivo_texto?.trim() || null},
        nivel_atividade = ${data.nivel_atividade || null},
        patologias = ${data.patologias && data.patologias.length > 0 ? data.patologias : []},
        restricoes_alimentares = ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : []},
        alergias = ${data.alergias && data.alergias.length > 0 ? data.alergias : []},
        medicamentos = ${data.medicamentos?.trim() || null},
        suplementos = ${data.suplementos?.trim() || null},
        refeicoes_por_dia = ${data.refeicoes_por_dia != null && !isNaN(data.refeicoes_por_dia) ? data.refeicoes_por_dia : null},
        horario_acorda = ${data.horario_acorda?.trim() || null},
        horario_dorme = ${data.horario_dorme?.trim() || null},
        litros_agua = ${data.litros_agua != null && !isNaN(data.litros_agua) ? data.litros_agua : null},
        atividade_fisica = ${data.atividade_fisica === true},
        atividade_fisica_descricao = ${data.atividade_fisica_descricao?.trim() || null},
        observacoes = ${data.observacoes?.trim() || null}
      WHERE id = ${patientId} AND nutricionista_id = ${nutriId}
      RETURNING *
    `

    if (!rows || rows.length === 0) {
      throw new Error('Paciente não encontrado ou sem permissão de alteração.')
    }

    const r = rows[0] as any
    return {
      id: r.id,
      nutricionista_id: r.nutricionista_id,
      nome: r.nome,
      email: r.email || undefined,
      telefone: r.telefone || undefined,
      whatsapp: r.whatsapp || undefined,
      data_nascimento: r.data_nascimento ? toDateStr(r.data_nascimento) : undefined,
      sexo: r.sexo || undefined,
      peso_inicial: r.peso_inicial ? Number(r.peso_inicial) : undefined,
      altura: r.altura ? Number(r.altura) : undefined,
      objetivos: r.objetivos || [],
      objetivo_texto: r.objetivo_texto || undefined,
      nivel_atividade: r.nivel_atividade || undefined,
      patologias: r.patologias || [],
      restricoes_alimentares: r.restricoes_alimentares || [],
      alergias: r.alergias || [],
      medicamentos: r.medicamentos || undefined,
      suplementos: r.suplementos || undefined,
      refeicoes_por_dia: r.refeicoes_por_dia ? Number(r.refeicoes_por_dia) : undefined,
      horario_acorda: r.horario_acorda || undefined,
      horario_dorme: r.horario_dorme || undefined,
      litros_agua: r.litros_agua ? Number(r.litros_agua) : undefined,
      atividade_fisica: r.atividade_fisica === true,
      atividade_fisica_descricao: r.atividade_fisica_descricao || undefined,
      observacoes: r.observacoes || undefined,
      created_at: r.created_at,
    }
  }

  /**
   * Registra uma nova consulta para um paciente
   */
  static async createConsultation(data: {
    paciente_id: string
    data_consulta: string
    peso?: number
    cintura?: number
    quadril?: number
    percentual_gordura?: number
    proximo_retorno?: string | null
    observacoes?: string
  }): Promise<Consultation> {
    const sql = this.getSql()
    const rows = await sql`
      INSERT INTO public.consultas (
        paciente_id,
        data_consulta,
        peso,
        cintura,
        quadril,
        percentual_gordura,
        proximo_retorno,
        observacoes,
        created_at
      ) VALUES (
        ${data.paciente_id},
        ${data.data_consulta},
        ${data.peso || null},
        ${data.cintura || null},
        ${data.quadril || null},
        ${data.percentual_gordura || null},
        ${data.proximo_retorno || null},
        ${data.observacoes?.trim() || null},
        NOW()
      )
      RETURNING *
    `
    const c = rows[0]
    return {
      id: c.id,
      paciente_id: c.paciente_id,
      data_consulta: toDateStr(c.data_consulta),
      peso: c.peso ? Number(c.peso) : undefined,
      cintura: c.cintura ? Number(c.cintura) : undefined,
      quadril: c.quadril ? Number(c.quadril) : undefined,
      percentual_gordura: c.percentual_gordura ? Number(c.percentual_gordura) : undefined,
      proximo_retorno: c.proximo_retorno ? toDateStr(c.proximo_retorno) : null,
      observacoes: c.observacoes || undefined,
      created_at: c.created_at,
    }
  }
}
