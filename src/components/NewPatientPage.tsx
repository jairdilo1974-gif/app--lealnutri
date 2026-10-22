import React, { useState, useMemo, useEffect } from 'react'
import { NeonDataService, Patient } from '@/services/neonData'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  Apple,
  Bed,
  Sun,
  AlertTriangle,
  Loader2,
  User,
  Plus,
  Save,
  Pencil
} from 'lucide-react'

interface NewPatientPageProps {
  nutriId: string
  patientToEdit?: Patient | null
  onCancel: () => void
  onSuccess: (savedPatient: Patient) => void
}

type TabKey = 'pessoal' | 'clinico' | 'habitos'

export const NewPatientPage: React.FC<NewPatientPageProps> = ({
  nutriId,
  patientToEdit,
  onCancel,
  onSuccess,
}) => {
  const isEditing = Boolean(patientToEdit)
  const [activeTab, setActiveTab] = useState<TabKey>('pessoal')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ================= Aba 1 — Pessoal =================
  const [nome, setNome] = useState(patientToEdit?.nome || '')
  const [dataNascimento, setDataNascimento] = useState(patientToEdit?.data_nascimento || '')
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro'>((patientToEdit?.sexo as any) || 'Feminino')
  const [dataInicioTratamento, setDataInicioTratamento] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [telefone, setTelefone] = useState(patientToEdit?.telefone || '')
  const [whatsapp, setWhatsapp] = useState(patientToEdit?.whatsapp || '')
  const [email, setEmail] = useState(patientToEdit?.email || '')

  // ================= Aba 2 — Clínico =================
  const [pesoKg, setPesoKg] = useState(patientToEdit?.peso_inicial ? String(patientToEdit.peso_inicial) : '')
  const [alturaCm, setAlturaCm] = useState(patientToEdit?.altura ? String(Math.round(patientToEdit.altura * 100)) : '')
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>(patientToEdit?.objetivos || [])
  const [objetivoLivre, setObjetivoLivre] = useState(patientToEdit?.objetivo_texto || '')
  const [nivelAtividade, setNivelAtividade] = useState(patientToEdit?.nivel_atividade || 'Moderadamente ativo')
  
  // Opções padrão
  const patologiasOpcoes = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto',
  ]

  const restricoesOpcoes = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar',
  ]

  const alergiasOpcoes = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar',
  ]

  // Separa predefinidas de customizadas
  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState<string[]>(
    () => (patientToEdit?.patologias || []).filter((p) => patologiasOpcoes.includes(p))
  )
  const [patologiaExtra, setPatologiaExtra] = useState('')
  const [patologiasCustom, setPatologiasCustom] = useState<string[]>(
    () => (patientToEdit?.patologias || []).filter((p) => !patologiasOpcoes.includes(p) && p !== 'Nenhum')
  )

  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>(
    () => (patientToEdit?.restricoes_alimentares || []).filter((r) => restricoesOpcoes.includes(r))
  )
  const [restricaoExtra, setRestricaoExtra] = useState('')
  const [restricoesCustom, setRestricoesCustom] = useState<string[]>(
    () => (patientToEdit?.restricoes_alimentares || []).filter((r) => !restricoesOpcoes.includes(r) && r !== 'Nenhum')
  )

  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>(
    () => (patientToEdit?.alergias || []).filter((a) => alergiasOpcoes.includes(a))
  )
  const [alergiaExtra, setAlergiaExtra] = useState('')
  const [alergiasCustom, setAlergiasCustom] = useState<string[]>(
    () => (patientToEdit?.alergias || []).filter((a) => !alergiasOpcoes.includes(a) && a !== 'Nenhum')
  )

  const [medicamentos, setMedicamentos] = useState(patientToEdit?.medicamentos || '')
  const [suplementos, setSuplementos] = useState(patientToEdit?.suplementos || '')

  // ================= Aba 3 — Hábitos =================
  const [refeicoesDia, setRefeicoesDia] = useState<string>(
    patientToEdit?.refeicoes_por_dia ? String(patientToEdit.refeicoes_por_dia) : '3'
  )
  const [horarioAcorda, setHorarioAcorda] = useState(patientToEdit?.horario_acorda || '')
  const [horarioDorme, setHorarioDorme] = useState(patientToEdit?.horario_dorme || '')
  const [litrosAgua, setLitrosAgua] = useState(
    patientToEdit?.litros_agua ? String(patientToEdit.litros_agua) : ''
  )
  const [praticaAtividade, setPraticaAtividade] = useState<boolean>(
    patientToEdit?.atividade_fisica === true
  )
  const [atividadeDescricao, setAtividadeDescricao] = useState(
    patientToEdit?.atividade_fisica_descricao || ''
  )
  const [observacoes, setObservacoes] = useState(patientToEdit?.observacoes || '')

  // Se o paciente a ser editado mudar, atualiza o formulário
  useEffect(() => {
    if (patientToEdit) {
      setNome(patientToEdit.nome || '')
      setDataNascimento(patientToEdit.data_nascimento || '')
      setSexo((patientToEdit.sexo as any) || 'Feminino')
      setTelefone(patientToEdit.telefone || '')
      setWhatsapp(patientToEdit.whatsapp || '')
      setEmail(patientToEdit.email || '')
      setPesoKg(patientToEdit.peso_inicial ? String(patientToEdit.peso_inicial) : '')
      setAlturaCm(patientToEdit.altura ? String(Math.round(patientToEdit.altura * 100)) : '')
      setObjetivosSelecionados(patientToEdit.objetivos || [])
      setObjetivoLivre(patientToEdit.objetivo_texto || '')
      setNivelAtividade(patientToEdit.nivel_atividade || 'Moderadamente ativo')
      setPatologiasSelecionadas((patientToEdit.patologias || []).filter((p) => patologiasOpcoes.includes(p)))
      setPatologiasCustom((patientToEdit.patologias || []).filter((p) => !patologiasOpcoes.includes(p) && p !== 'Nenhum'))
      setRestricoesSelecionadas((patientToEdit.restricoes_alimentares || []).filter((r) => restricoesOpcoes.includes(r)))
      setRestricoesCustom((patientToEdit.restricoes_alimentares || []).filter((r) => !restricoesOpcoes.includes(r) && r !== 'Nenhum'))
      setAlergiasSelecionadas((patientToEdit.alergias || []).filter((a) => alergiasOpcoes.includes(a)))
      setAlergiasCustom((patientToEdit.alergias || []).filter((a) => !alergiasOpcoes.includes(a) && a !== 'Nenhum'))
      setMedicamentos(patientToEdit.medicamentos || '')
      setSuplementos(patientToEdit.suplementos || '')
      setRefeicoesDia(patientToEdit.refeicoes_por_dia ? String(patientToEdit.refeicoes_por_dia) : '3')
      setHorarioAcorda(patientToEdit.horario_acorda || '')
      setHorarioDorme(patientToEdit.horario_dorme || '')
      setLitrosAgua(patientToEdit.litros_agua ? String(patientToEdit.litros_agua) : '')
      setPraticaAtividade(patientToEdit.atividade_fisica === true)
      setAtividadeDescricao(patientToEdit.atividade_fisica_descricao || '')
      setObservacoes(patientToEdit.observacoes || '')
    }
  }, [patientToEdit])

  // ================= Helpers e Cálculos =================
  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return null
    const birth = new Date(dataNascimento)
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }, [dataNascimento])

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const formatTimeInput = (val: string): string => {
    const raw = val.trim().replace(/\D/g, '')
    if (!raw) return ''
    if (raw.length === 1 || raw.length === 2) {
      const h = parseInt(raw, 10)
      if (h >= 0 && h <= 23) {
        return `${String(h).padStart(2, '0')}:00`
      }
    } else if (raw.length === 3) {
      const h = parseInt(raw.slice(0, 1), 10)
      const m = parseInt(raw.slice(1), 10)
      if (h <= 23 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
    } else if (raw.length >= 4) {
      const h = parseInt(raw.slice(0, 2), 10)
      const m = parseInt(raw.slice(2, 4), 10)
      if (h <= 23 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
    }
    return val
  }

  const imcInfo = useMemo(() => {
    const p = parseFloat(pesoKg)
    const hCm = parseFloat(alturaCm)
    if (!p || !hCm || p <= 0 || hCm <= 0) {
      return null
    }
    const hM = hCm / 100
    const val = p / (hM * hM)
    const formatted = val.toFixed(1)

    let classification = ''
    let badgeColor = 'bg-brand-50 text-brand-700 border-brand-200'

    if (val < 18.5) {
      classification = 'Abaixo do peso'
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200'
    } else if (val < 25) {
      classification = 'Peso adequado'
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    } else if (val < 30) {
      classification = 'Sobrepeso'
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200'
    } else if (val < 35) {
      classification = 'Obesidade Grau I'
      badgeColor = 'bg-red-50 text-red-700 border-red-200'
    } else {
      classification = 'Obesidade Grau II/III'
      badgeColor = 'bg-red-100 text-red-800 border-red-300'
    }

    return { value: formatted, classification, badgeColor }
  }, [pesoKg, alturaCm])

  const objetivosOpcoes = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar',
  ]

  const toggleArrayOption = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    option: string
  ) => {
    if (option === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([])
      } else {
        setList(['Nenhum'])
      }
      return
    }

    let updated = currentList.filter((item) => item !== 'Nenhum')
    if (updated.includes(option)) {
      updated = updated.filter((item) => item !== option)
    } else {
      updated.push(option)
    }
    setList(updated)
  }

  // Submissão do formulário (Criação ou Edição)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nome.trim()) {
      setErrorMessage('Por favor, informe o nome completo do paciente.')
      setActiveTab('pessoal')
      return
    }

    try {
      setSaving(true)

      const alturaMetros = alturaCm ? parseFloat(alturaCm) / 100 : undefined
      const pesoNum = pesoKg ? parseFloat(pesoKg) : undefined

      const patologiasFinais = [
        ...patologiasSelecionadas.filter((p) => p !== 'Nenhum'),
        ...patologiasCustom,
      ]
      const restricoesFinais = [
        ...restricoesSelecionadas.filter((r) => r !== 'Nenhum'),
        ...restricoesCustom,
      ]
      const alergiasFinais = [
        ...alergiasSelecionadas.filter((a) => a !== 'Nenhum'),
        ...alergiasCustom,
      ]

      const payload = {
        nome: nome.trim(),
        email: email.trim() || undefined,
        telefone: telefone.trim() || undefined,
        whatsapp: whatsapp.trim() || telefone.trim() || undefined,
        data_nascimento: dataNascimento || undefined,
        sexo,
        peso_inicial: pesoNum,
        altura: alturaMetros,
        objetivos: objetivosSelecionados,
        objetivo_texto: objetivoLivre.trim() || undefined,
        nivel_atividade: nivelAtividade,
        patologias: patologiasFinais,
        restricoes_alimentares: restricoesFinais,
        alergias: alergiasFinais,
        medicamentos: medicamentos.trim() || undefined,
        suplementos: suplementos.trim() || undefined,
        refeicoes_por_dia: refeicoesDia ? parseInt(refeicoesDia, 10) : undefined,
        horario_acorda: horarioAcorda || undefined,
        horario_dorme: horarioDorme || undefined,
        litros_agua: litrosAgua ? parseFloat(litrosAgua) : undefined,
        atividade_fisica: praticaAtividade,
        atividade_fisica_descricao: praticaAtividade ? atividadeDescricao.trim() || undefined : undefined,
        observacoes: observacoes.trim() || undefined,
      }

      let savedResult: Patient
      if (isEditing && patientToEdit) {
        savedResult = await NeonDataService.updatePatient(patientToEdit.id, nutriId, payload)
        setSuccessMessage('Ficha do paciente atualizada com sucesso!')
      } else {
        savedResult = await NeonDataService.createPatient(nutriId, payload)

        // Regra do Prompt 5: "Preciso que ao cadastrar o Paciente eu possa colocar a data de início do tratamento, essa data ficará registrada como a primeira consulta"
        if (dataInicioTratamento) {
          try {
            await NeonDataService.createConsultation({
              paciente_id: savedResult.id,
              data_consulta: dataInicioTratamento,
              peso: pesoNum,
              observacoes: 'Início do acompanhamento nutricional',
            })
          } catch (consErr) {
            console.warn('Aviso ao registrar consulta inicial:', consErr)
          }
        }

        setSuccessMessage('Paciente cadastrado com sucesso!')
      }

      setTimeout(() => {
        onSuccess(savedResult)
      }, 700)
    } catch (err: any) {
      console.error('Erro ao salvar paciente:', err)
      setErrorMessage(err.message || 'Erro ao salvar alterações no Neon.')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner de Retorno / Título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="rounded-xl border-emerald-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 gap-2 h-10 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isEditing ? (
                <>
                  <Pencil className="w-6 h-6 text-emerald-600" />
                  Editar Ficha do Paciente
                </>
              ) : (
                'Cadastrar Novo Paciente'
              )}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Editando prontuário de ${patientToEdit?.nome}. Altere os dados em qualquer uma das 3 abas e clique em Salvar.`
                : 'Preencha os dados organizados em 3 etapas. Apenas o nome é obrigatório.'}
            </p>
          </div>
        </div>

        {/* Indicador de progresso */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-white px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isEditing ? 'Edição em Tempo Real' : 'Ficha de Anamnese Nutricional'}</span>
        </div>
      </div>

      {/* Alertas de Sucesso e Erro */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-sm font-semibold">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 animate-in fade-in shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Navegação entre as 3 Abas */}
        <div className="bg-white p-1.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pessoal')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pessoal'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Aba 1 &bull; Pessoal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinico')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'clinico'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Aba 2 &bull; Clínico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habitos')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'habitos'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Aba 3 &bull; Hábitos</span>
          </button>
        </div>

        {/* ================= ABA 1: PESSOAL ================= */}
        {activeTab === 'pessoal' && (
          <Card className="border-emerald-100/90 shadow-sm bg-white overflow-hidden animate-in fade-in">
            <CardHeader className="bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/30 border-b border-emerald-50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Informações Pessoais e Contato
              </CardTitle>
              <p className="text-xs text-slate-500">
                Identificação cadastral básica do paciente. O nome completo é o único campo obrigatório.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Nome completo <span className="text-emerald-600">* (obrigatório)</span></span>
                  <span className="text-[11px] font-normal text-slate-400">Como o paciente prefere ser chamado</span>
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Ex: Mariana Silva Albuquerque"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
              </div>

              {/* Data de Nascimento e Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dataNascimento" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Data de nascimento</span>
                    {idadeCalculada !== null && (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                        {idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O sistema calcula a idade automaticamente.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Sexo (seleção única)
                  </Label>
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {(['Feminino', 'Masculino', 'Outro'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSexo(s)}
                        className={`h-11 rounded-xl text-xs font-bold transition-all border ${
                          sexo === s
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data de Início do Tratamento (Prompt 5: registrada como a primeira consulta) */}
              {!isEditing && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                  <Label htmlFor="dataInicio" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Data de início do tratamento</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Primeira consulta registrada</span>
                  </Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicioTratamento}
                    onChange={(e) => setDataInicioTratamento(e.target.value)}
                    className="h-11 border-emerald-200 focus:border-emerald-500 text-sm bg-white font-medium"
                  />
                  <p className="text-[11px] text-slate-500">
                    Esta data será registrada automaticamente como a primeira consulta do histórico do paciente.
                  </p>
                </div>
              )}

              {/* Telefone, WhatsApp e E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="telefone" className="text-xs font-bold text-slate-700">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>WhatsApp</span>
                    <button
                      type="button"
                      onClick={() => setWhatsapp(telefone)}
                      className="text-[10px] text-emerald-600 hover:underline font-semibold"
                    >
                      Copiar tel
                    </button>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="paciente@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Botão de avanço rápido */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setActiveTab('clinico')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6"
                >
                  Próxima etapa: Clínico &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= ABA 2: CLÍNICO ================= */}
        {activeTab === 'clinico' && (
          <Card className="border-emerald-100/90 shadow-sm bg-white overflow-hidden animate-in fade-in">
            <CardHeader className="bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/30 border-b border-emerald-50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                Dados Clínicos e Antropométricos
              </CardTitle>
              <p className="text-xs text-slate-500">
                Medidas corporais com cálculo automático de IMC, objetivos clínicos e histórico de saúde.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Peso, Altura e IMC Automático */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                <div className="space-y-1.5">
                  <Label htmlFor="peso" className="text-xs font-bold text-slate-700">
                    Peso atual em kg
                  </Label>
                  <div className="relative">
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 68.5"
                      value={pesoKg}
                      onChange={(e) => setPesoKg(e.target.value)}
                      className="h-11 pr-12 border-slate-200 focus:border-emerald-500 text-sm font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="altura" className="text-xs font-bold text-slate-700">
                    Altura em cm
                  </Label>
                  <div className="relative">
                    <Input
                      id="altura"
                      type="number"
                      step="1"
                      placeholder="Ex: 172"
                      value={alturaCm}
                      onChange={(e) => setAlturaCm(e.target.value)}
                      className="h-11 pr-12 border-slate-200 focus:border-emerald-500 text-sm font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                      cm
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>IMC (calculado automaticamente)</span>
                    <span className="text-[10px] text-slate-400 font-normal">somente leitura</span>
                  </Label>
                  <div className="h-11 px-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    {imcInfo ? (
                      <>
                        <span className="text-base font-black text-slate-800">
                          {imcInfo.value} <span className="text-xs font-normal text-slate-400">kg/m²</span>
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${imcInfo.badgeColor}`}>
                          {imcInfo.classification}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Informe peso e altura
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Objetivo (Múltipla escolha + campo livre) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Objetivo (múltipla escolha)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {objetivosOpcoes.map((obj) => {
                    const isSelected = objetivosSelecionados.includes(obj)
                    return (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setObjetivosSelecionados(objetivosSelecionados.filter((o) => o !== obj))
                          } else {
                            setObjetivosSelecionados([...objetivosSelecionados, obj])
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {obj}
                      </button>
                    )
                  })}
                </div>

                <Input
                  type="text"
                  placeholder="Campo de texto livre adicional para detalhar o objetivo..."
                  value={objetivoLivre}
                  onChange={(e) => setObjetivoLivre(e.target.value)}
                  className="h-10 mt-2 border-slate-200 text-xs"
                />
              </div>

              {/* Nível de atividade física (Seleção única) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Nível de atividade física (seleção única)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    'Sedentário',
                    'Levemente ativo',
                    'Moderadamente ativo',
                    'Muito ativo',
                    'Extremamente ativo',
                  ].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNivelAtividade(level)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                        nivelAtividade === level
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patologias ou condições de saúde */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Patologias ou condições de saúde
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleArrayOption(patologiasSelecionadas, setPatologiasSelecionadas, 'Nenhum')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      patologiasSelecionadas.includes('Nenhum')
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Nenhum
                  </button>

                  {patologiasOpcoes.map((pat) => {
                    const isSelected = patologiasSelecionadas.includes(pat)
                    return (
                      <button
                        key={pat}
                        type="button"
                        onClick={() => toggleArrayOption(patologiasSelecionadas, setPatologiasSelecionadas, pat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {pat}
                      </button>
                    )
                  })}

                  {patologiasCustom.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setPatologiasCustom(patologiasCustom.filter((_, i) => i !== idx))}
                        className="text-emerald-900 hover:text-red-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="Adicionar outra patologia livremente..."
                    value={patologiaExtra}
                    onChange={(e) => setPatologiaExtra(e.target.value)}
                    className="h-9 text-xs border-slate-200"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (patologiaExtra.trim()) {
                        setPatologiasCustom([...patologiasCustom, patologiaExtra.trim()])
                        setPatologiasSelecionadas(patologiasSelecionadas.filter((p) => p !== 'Nenhum'))
                        setPatologiaExtra('')
                      }
                    }}
                    className="h-9 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Restrições alimentares */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Restrições alimentares
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleArrayOption(restricoesSelecionadas, setRestricoesSelecionadas, 'Nenhum')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      restricoesSelecionadas.includes('Nenhum')
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Nenhum
                  </button>

                  {restricoesOpcoes.map((rest) => {
                    const isSelected = restricoesSelecionadas.includes(rest)
                    return (
                      <button
                        key={rest}
                        type="button"
                        onClick={() => toggleArrayOption(restricoesSelecionadas, setRestricoesSelecionadas, rest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {rest}
                      </button>
                    )
                  })}

                  {restricoesCustom.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setRestricoesCustom(restricoesCustom.filter((_, i) => i !== idx))}
                        className="text-emerald-900 hover:text-red-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="Adicionar outra restrição alimentar livremente..."
                    value={restricaoExtra}
                    onChange={(e) => setRestricaoExtra(e.target.value)}
                    className="h-9 text-xs border-slate-200"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (restricaoExtra.trim()) {
                        setRestricoesCustom([...restricoesCustom, restricaoExtra.trim()])
                        setRestricoesSelecionadas(restricoesSelecionadas.filter((r) => r !== 'Nenhum'))
                        setRestricaoExtra('')
                      }
                    }}
                    className="h-9 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Alergias alimentares */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Alergias alimentares
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleArrayOption(alergiasSelecionadas, setAlergiasSelecionadas, 'Nenhum')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      alergiasSelecionadas.includes('Nenhum')
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Nenhum
                  </button>

                  {alergiasOpcoes.map((alerg) => {
                    const isSelected = alergiasSelecionadas.includes(alerg)
                    return (
                      <button
                        key={alerg}
                        type="button"
                        onClick={() => toggleArrayOption(alergiasSelecionadas, setAlergiasSelecionadas, alerg)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {alerg}
                      </button>
                    )
                  })}

                  {alergiasCustom.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setAlergiasCustom(alergiasCustom.filter((_, i) => i !== idx))}
                        className="text-emerald-900 hover:text-red-600 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="Adicionar outra alergia alimentar livremente..."
                    value={alergiaExtra}
                    onChange={(e) => setAlergiaExtra(e.target.value)}
                    className="h-9 text-xs border-slate-200"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (alergiaExtra.trim()) {
                        setAlergiasCustom([...alergiasCustom, alergiaExtra.trim()])
                        setAlergiasSelecionadas(alergiasSelecionadas.filter((a) => a !== 'Nenhum'))
                        setAlergiaExtra('')
                      }
                    }}
                    className="h-9 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Medicamentos e Suplementos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="medicamentos" className="text-xs font-bold text-slate-700">
                    Medicamentos contínuos (texto livre)
                  </Label>
                  <textarea
                    id="medicamentos"
                    rows={2}
                    placeholder="Ex: Levotiroxina 50mcg pela manhã, Losartana 50mg..."
                    value={medicamentos}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="suplementos" className="text-xs font-bold text-slate-700">
                    Suplementos em uso (texto livre)
                  </Label>
                  <textarea
                    id="suplementos"
                    rows={2}
                    placeholder="Ex: Creatina 5g/dia, Whey protein pós-treino, Vitamina D..."
                    value={suplementos}
                    onChange={(e) => setSuplementos(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Navegação entre abas */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('pessoal')}
                  className="text-xs text-slate-600"
                >
                  &larr; Voltar para Pessoal
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('habitos')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6"
                >
                  Próxima etapa: Hábitos &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= ABA 3: HÁBITOS ================= */}
        {activeTab === 'habitos' && (
          <Card className="border-emerald-100/90 shadow-sm bg-white overflow-hidden animate-in fade-in">
            <CardHeader className="bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/30 border-b border-emerald-50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Apple className="w-5 h-5 text-emerald-600" />
                Rotina Diária e Hábitos de Vida
              </CardTitle>
              <p className="text-xs text-slate-500">
                Horários de sono, ingestão hídrica, rotina alimentar e prática de exercícios.
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Refeições e Água */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="refeicoes" className="text-xs font-bold text-slate-700">
                    Quantas refeições faz por dia (número)
                  </Label>
                  <Input
                    id="refeicoes"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Ex: 4"
                    value={refeicoesDia}
                    onChange={(e) => setRefeicoesDia(e.target.value)}
                    className="h-11 border-slate-200 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agua" className="text-xs font-bold text-slate-700">
                    Quantidade de água por dia
                  </Label>
                  <div className="relative">
                    <Input
                      id="agua"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 2.5"
                      value={litrosAgua}
                      onChange={(e) => setLitrosAgua(e.target.value)}
                      className="h-11 pr-16 border-slate-200 focus:border-emerald-500 text-sm font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                      litros
                    </span>
                  </div>
                </div>
              </div>

              {/* Horários: Acorda e Dorme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                <div className="space-y-1.5">
                  <Label htmlFor="acorda" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Horário que acorda
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Ex: 6 &rarr; 06:00, 630 &rarr; 06:30</span>
                  </Label>
                  <Input
                    id="acorda"
                    type="text"
                    placeholder="Ex: 6 ou 06:30"
                    value={horarioAcorda}
                    onChange={(e) => setHorarioAcorda(e.target.value)}
                    onBlur={(e) => setHorarioAcorda(formatTimeInput(e.target.value))}
                    className="h-11 border-slate-200 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dorme" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-indigo-500" />
                      Horário que dorme
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Ex: 23 &rarr; 23:00, 2230 &rarr; 22:30</span>
                  </Label>
                  <Input
                    id="dorme"
                    type="text"
                    placeholder="Ex: 23 ou 22:30"
                    value={horarioDorme}
                    onChange={(e) => setHorarioDorme(e.target.value)}
                    onBlur={(e) => setHorarioDorme(formatTimeInput(e.target.value))}
                    className="h-11 border-slate-200 focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Atividade Física: Sim/Não */}
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Pratica atividade física?
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Se sim, detalhe o tipo de exercício e a frequência semanal.
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPraticaAtividade(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !praticaAtividade
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setPraticaAtividade(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        praticaAtividade
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {praticaAtividade && (
                  <div className="pt-2 border-t border-slate-100 animate-in fade-in space-y-1.5">
                    <Label htmlFor="atividadeDesc" className="text-xs font-bold text-emerald-800">
                      Qual atividade e frequência semanal?
                    </Label>
                    <Input
                      id="atividadeDesc"
                      type="text"
                      placeholder="Ex: Musculação 4x na semana + corrida aos sábados"
                      value={atividadeDescricao}
                      onChange={(e) => setAtividadeDescricao(e.target.value)}
                      className="h-10 text-xs border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Observações Gerais */}
              <div className="space-y-1.5">
                <Label htmlFor="observacoes" className="text-xs font-bold text-slate-700">
                  Observações gerais (texto livre)
                </Label>
                <textarea
                  id="observacoes"
                  rows={3}
                  placeholder="Anotações comportamentais, preferências no plano alimentar, histórico familiar..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Navegação entre abas */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('clinico')}
                  className="text-xs text-slate-600"
                >
                  &larr; Voltar para Clínico
                </Button>

                <div className="text-xs text-slate-400">
                  {isEditing ? 'Tudo pronto! Clique em "Salvar Alterações" abaixo.' : 'Tudo pronto! Clique em "Salvar Paciente" abaixo.'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barra Fixa / Inferior de Ações para Salvar */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isEditing ? (
              <>Salvando alterações do paciente no Neon PostgreSQL.</>
            ) : (
              <>Vincular paciente à sua conta de nutricionista (<strong className="text-slate-800">nutricionista_id</strong>).</>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
              className="text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 h-11 shadow-md shadow-emerald-600/30 gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando no Neon DB...
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Salvar e Abrir Prontuário
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
export default NewPatientPage
