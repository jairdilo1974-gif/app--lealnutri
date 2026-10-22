import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { NeonDataService, PatientDetail, Consultation, MealPlan } from '@/services/neonData'
import { WeightChart } from '@/components/WeightChart'
import { NewConsultationModal } from '@/components/NewConsultationModal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  User,
  HeartPulse,
  Apple,
  Calendar,
  Clock,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Save,
  Sun,
  Bed,
  TrendingDown,
  Activity
} from 'lucide-react'

interface PatientProfilePageProps {
  patientId: string
  nutriId: string
  onBack: () => void
  onPatientUpdated?: () => void
}

type TabKey = 'pessoal' | 'clinico' | 'habitos'

export const PatientProfilePage: React.FC<PatientProfilePageProps> = ({
  patientId,
  nutriId,
  onBack,
  onPatientUpdated,
}) => {
  const [profile, setProfile] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Controle do Modal de Nova Consulta
  const [showConsultationModal, setShowConsultationModal] = useState(false)

  // Feedback de alteração na Seção 1
  const [savingPatient, setSavingPatient] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null)

  // Visualização de plano alimentar clicado (Seção 3)
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)

  // ================= Seção 1: Abas de Dados do Paciente =================
  const [activeTab, setActiveTab] = useState<TabKey>('pessoal')

  // Aba 1: Pessoal
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino')
  const [telefone, setTelefone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  // Aba 2: Clínico
  const [pesoKg, setPesoKg] = useState('')
  const [alturaCm, setAlturaCm] = useState('')
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([])
  const [objetivoLivre, setObjetivoLivre] = useState('')
  const [nivelAtividade, setNivelAtividade] = useState('Moderadamente ativo')
  
  const objetivosOpcoes = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar',
  ]

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

  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState<string[]>([])
  const [patologiaExtra, setPatologiaExtra] = useState('')
  const [patologiasCustom, setPatologiasCustom] = useState<string[]>([])

  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>([])
  const [restricaoExtra, setRestricaoExtra] = useState('')
  const [restricoesCustom, setRestricoesCustom] = useState<string[]>([])

  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>([])
  const [alergiaExtra, setAlergiaExtra] = useState('')
  const [alergiasCustom, setAlergiasCustom] = useState<string[]>([])

  const [medicamentos, setMedicamentos] = useState('')
  const [suplementos, setSuplementos] = useState('')

  // Aba 3: Hábitos
  const [refeicoesDia, setRefeicoesDia] = useState<string>('3')
  const [horarioAcorda, setHorarioAcorda] = useState('')
  const [horarioDorme, setHorarioDorme] = useState('')
  const [litrosAgua, setLitrosAgua] = useState('')
  const [praticaAtividade, setPraticaAtividade] = useState<boolean>(false)
  const [atividadeDescricao, setAtividadeDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Sincroniza dados do paciente para os states editáveis
  const populateFields = useCallback((p: PatientDetail) => {
    setNome(p.nome || '')
    setDataNascimento(p.data_nascimento || '')
    setSexo((p.sexo as any) || 'Feminino')
    setTelefone(p.telefone || '')
    setWhatsapp(p.whatsapp || '')
    setEmail(p.email || '')
    setPesoKg(p.peso_inicial ? String(p.peso_inicial) : '')
    setAlturaCm(p.altura ? String(Math.round(p.altura * 100)) : '')
    setObjetivosSelecionados(p.objetivos || [])
    setObjetivoLivre(p.objetivo_texto || '')
    setNivelAtividade(p.nivel_atividade || 'Moderadamente ativo')

    setPatologiasSelecionadas((p.patologias || []).filter((item) => patologiasOpcoes.includes(item)))
    setPatologiasCustom((p.patologias || []).filter((item) => !patologiasOpcoes.includes(item) && item !== 'Nenhum'))

    setRestricoesSelecionadas((p.restricoes_alimentares || []).filter((item) => restricoesOpcoes.includes(item)))
    setRestricoesCustom((p.restricoes_alimentares || []).filter((item) => !restricoesOpcoes.includes(item) && item !== 'Nenhum'))

    setAlergiasSelecionadas((p.alergias || []).filter((item) => alergiasOpcoes.includes(item)))
    setAlergiasCustom((p.alergias || []).filter((item) => !alergiasOpcoes.includes(item) && item !== 'Nenhum'))

    setMedicamentos(p.medicamentos || '')
    setSuplementos(p.suplementos || '')

    setRefeicoesDia(p.refeicoes_por_dia ? String(p.refeicoes_por_dia) : '3')
    setHorarioAcorda(p.horario_acorda || '')
    setHorarioDorme(p.horario_dorme || '')
    setLitrosAgua(p.litros_agua ? String(p.litros_agua) : '')
    setPraticaAtividade(p.atividade_fisica === true)
    setAtividadeDescricao(p.atividade_fisica_descricao || '')
    setObservacoes(p.observacoes || '')
  }, [])

  // Carrega paciente do Neon
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await NeonDataService.getPatientProfile(patientId, nutriId)
      if (data) {
        setProfile(data)
        populateFields(data)
      } else {
        setError('Paciente não encontrado.')
      }
    } catch (err: any) {
      console.error('Erro ao carregar perfil do paciente:', err)
      setError('Erro ao carregar dados do paciente do banco Neon.')
    } finally {
      setLoading(false)
    }
  }, [patientId, nutriId, populateFields])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Formatação de telefone
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  // Conversão de horário
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

  // IMC atual
  const imcInfo = useMemo(() => {
    const p = parseFloat(pesoKg)
    const hCm = parseFloat(alturaCm)
    if (!p || !hCm || p <= 0 || hCm <= 0) return null
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

  // Idade calculada
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

  // ================= Salvar Alterações da Seção 1 =================
  const handleSavePatientData = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveErrorMsg(null)
    setSaveSuccessMsg(null)

    if (!nome.trim()) {
      setSaveErrorMsg('O nome completo do paciente é obrigatório.')
      setActiveTab('pessoal')
      return
    }

    try {
      setSavingPatient(true)
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

      await NeonDataService.updatePatient(patientId, nutriId, {
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
      })

      setSaveSuccessMsg('Dados do paciente atualizados com sucesso no Neon!')
      if (onPatientUpdated) onPatientUpdated()
      await loadProfile()
    } catch (err: any) {
      console.error('Erro ao atualizar dados do paciente:', err)
      setSaveErrorMsg(err.message || 'Erro ao salvar alterações no Neon.')
    } finally {
      setSavingPatient(false)
    }
  }

  // Ao cadastrar nova consulta com sucesso
  const handleConsultationCreated = (nova: Consultation) => {
    setProfile((prev) => {
      if (!prev) return prev
      // Atualiza lista em ordem cronológica decrescente
      const updatedConsultas = [nova, ...(prev.consultas || [])].sort(
        (a, b) => new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
      )
      return {
        ...prev,
        consultas: updatedConsultas,
      }
    })
    if (onPatientUpdated) onPatientUpdated()
  }

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 mx-auto text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Carregando perfil completo do paciente...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-600 font-medium">{error || 'Paciente não encontrado.'}</p>
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Lista de Pacientes
        </Button>
      </div>
    )
  }

  // Consultas ordenadas da mais recente para a mais antiga (ordem cronológica decrescente)
  const cronologicalConsultas = [...profile.consultas].sort(
    (a, b) => new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
  )

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-300">
      {/* Top Banner de Navegação e Header do Perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl border-emerald-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 gap-2 h-10 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Pacientes
          </Button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {profile.nome}
              </h1>
              {profile.sexo && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {profile.sexo}
                </span>
              )}
              {idadeCalculada !== null && (
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {idadeCalculada} anos
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prontuário clínico e histórico nutricional &bull; Sincronizado ao Neon DB
            </p>
          </div>
        </div>

        {/* Badge de status */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-white px-3.5 py-2 rounded-xl border border-emerald-100 shadow-2xs text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{profile.consultas.length} {profile.consultas.length === 1 ? 'consulta registrada' : 'consultas registradas'}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 1 — DADOS DO PACIENTE (Com as 3 abas editáveis e botão Salvar) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Seção 1
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Dados do Paciente
            </h2>
            <p className="text-xs text-slate-500">
              Visualize e edite as informações cadastrais diretamente na página.
            </p>
          </div>
        </div>

        {/* Mensagens de Sucesso / Erro */}
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-2xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSavePatientData} className="space-y-4">
          {/* Abas: Pessoal, Clínico e Hábitos */}
          <div className="bg-white p-1.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pessoal')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pessoal'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Pessoal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clinico')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'clinico'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Clínico</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('habitos')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'habitos'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Hábitos</span>
            </button>
          </div>

          {/* Conteúdo da Aba 1 — Pessoal */}
          {activeTab === 'pessoal' && (
            <Card className="border-emerald-100 shadow-sm bg-white animate-in fade-in">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sec1-nome" className="text-xs font-bold text-slate-700">
                    Nome completo *
                  </Label>
                  <Input
                    id="sec1-nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="h-10 text-sm border-slate-200 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sec1-nasc" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Data de nascimento</span>
                      {idadeCalculada !== null && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                          {idadeCalculada} anos
                        </span>
                      )}
                    </Label>
                    <Input
                      id="sec1-nasc"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Sexo</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Feminino', 'Masculino', 'Outro'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSexo(s)}
                          className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                            sexo === s
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sec1-tel" className="text-xs font-bold text-slate-700">Telefone</Label>
                    <Input
                      id="sec1-tel"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sec1-zap" className="text-xs font-bold text-slate-700">WhatsApp</Label>
                    <Input
                      id="sec1-zap"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sec1-email" className="text-xs font-bold text-slate-700">Email</Label>
                    <Input
                      id="sec1-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conteúdo da Aba 2 — Clínico */}
          {activeTab === 'clinico' && (
            <Card className="border-emerald-100 shadow-sm bg-white animate-in fade-in">
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <div className="space-y-1">
                    <Label htmlFor="sec1-peso" className="text-xs font-bold text-slate-700">Peso atual em kg</Label>
                    <div className="relative">
                      <Input
                        id="sec1-peso"
                        type="number"
                        step="0.1"
                        value={pesoKg}
                        onChange={(e) => setPesoKg(e.target.value)}
                        className="h-10 pr-10 text-sm font-semibold border-slate-200 focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                        kg
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sec1-altura" className="text-xs font-bold text-slate-700">Altura em cm</Label>
                    <div className="relative">
                      <Input
                        id="sec1-altura"
                        type="number"
                        step="1"
                        value={alturaCm}
                        onChange={(e) => setAlturaCm(e.target.value)}
                        className="h-10 pr-10 text-sm font-semibold border-slate-200 focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                        cm
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>IMC (somente leitura)</span>
                    </Label>
                    <div className="h-10 px-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      {imcInfo ? (
                        <>
                          <span className="text-sm font-black text-slate-800">{imcInfo.value} kg/m²</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${imcInfo.badgeColor}`}>
                            {imcInfo.classification}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Informe peso e altura</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivos */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Objetivo(s)</Label>
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
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
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
                    placeholder="Objetivo complementar ou observações da meta..."
                    value={objetivoLivre}
                    onChange={(e) => setObjetivoLivre(e.target.value)}
                    className="h-9 text-xs border-slate-200"
                  />
                </div>

                {/* Nível de atividade */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Nível de atividade física</Label>
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
                        className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                          nivelAtividade === level
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patologias */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Patologias / Condições de saúde</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleArrayOption(patologiasSelecionadas, setPatologiasSelecionadas, 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        patologiasSelecionadas.includes('Nenhum')
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Nenhum
                    </button>
                    {patologiasOpcoes.map((pat) => (
                      <button
                        key={pat}
                        type="button"
                        onClick={() => toggleArrayOption(patologiasSelecionadas, setPatologiasSelecionadas, pat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          patologiasSelecionadas.includes(pat)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {patologiasSelecionadas.includes(pat) && '✓ '}
                        {pat}
                      </button>
                    ))}
                    {patologiasCustom.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item}
                        <button
                          type="button"
                          onClick={() => setPatologiasCustom(patologiasCustom.filter((_, i) => i !== idx))}
                          className="font-bold text-emerald-900 hover:text-red-600 ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Adicionar outra patologia..."
                      value={patologiaExtra}
                      onChange={(e) => setPatologiaExtra(e.target.value)}
                      className="h-8 text-xs border-slate-200"
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
                      className="h-8 text-xs font-semibold text-emerald-700 border-emerald-200"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Restrições alimentares */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Restrições alimentares</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleArrayOption(restricoesSelecionadas, setRestricoesSelecionadas, 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        restricoesSelecionadas.includes('Nenhum')
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Nenhum
                    </button>
                    {restricoesOpcoes.map((rest) => (
                      <button
                        key={rest}
                        type="button"
                        onClick={() => toggleArrayOption(restricoesSelecionadas, setRestricoesSelecionadas, rest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          restricoesSelecionadas.includes(rest)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {restricoesSelecionadas.includes(rest) && '✓ '}
                        {rest}
                      </button>
                    ))}
                    {restricoesCustom.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item}
                        <button
                          type="button"
                          onClick={() => setRestricoesCustom(restricoesCustom.filter((_, i) => i !== idx))}
                          className="font-bold text-emerald-900 hover:text-red-600 ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medicamentos e Suplementos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="sec1-meds" className="text-xs font-bold text-slate-700">Medicamentos contínuos</Label>
                    <textarea
                      id="sec1-meds"
                      rows={2}
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sec1-suple" className="text-xs font-bold text-slate-700">Suplementos em uso</Label>
                    <textarea
                      id="sec1-suple"
                      rows={2}
                      value={suplementos}
                      onChange={(e) => setSuplementos(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conteúdo da Aba 3 — Hábitos */}
          {activeTab === 'habitos' && (
            <Card className="border-emerald-100 shadow-sm bg-white animate-in fade-in">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="sec1-refeicoes" className="text-xs font-bold text-slate-700">Refeições por dia</Label>
                    <Input
                      id="sec1-refeicoes"
                      type="number"
                      value={refeicoesDia}
                      onChange={(e) => setRefeicoesDia(e.target.value)}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sec1-agua" className="text-xs font-bold text-slate-700">Quantidade de água</Label>
                    <div className="relative">
                      <Input
                        id="sec1-agua"
                        type="number"
                        step="0.1"
                        value={litrosAgua}
                        onChange={(e) => setLitrosAgua(e.target.value)}
                        className="h-10 pr-14 text-xs border-slate-200 focus:border-emerald-500 font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                        litros
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <div className="space-y-1">
                    <Label htmlFor="sec1-acorda" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Horário que acorda
                    </Label>
                    <Input
                      id="sec1-acorda"
                      type="text"
                      value={horarioAcorda}
                      onChange={(e) => setHorarioAcorda(e.target.value)}
                      onBlur={(e) => setHorarioAcorda(formatTimeInput(e.target.value))}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sec1-dorme" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-indigo-500" />
                      Horário que dorme
                    </Label>
                    <Input
                      id="sec1-dorme"
                      type="text"
                      value={horarioDorme}
                      onChange={(e) => setHorarioDorme(e.target.value)}
                      onBlur={(e) => setHorarioDorme(formatTimeInput(e.target.value))}
                      className="h-10 text-xs border-slate-200 focus:border-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Pratica atividade física?</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPraticaAtividade(false)}
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          !praticaAtividade ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        onClick={() => setPraticaAtividade(true)}
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          praticaAtividade ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        Sim
                      </button>
                    </div>
                  </div>

                  {praticaAtividade && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <Label htmlFor="sec1-ativDesc" className="text-xs text-emerald-800 font-semibold">
                        Atividade e frequência semanal:
                      </Label>
                      <Input
                        id="sec1-ativDesc"
                        type="text"
                        value={atividadeDescricao}
                        onChange={(e) => setAtividadeDescricao(e.target.value)}
                        className="h-9 text-xs border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sec1-obs" className="text-xs font-bold text-slate-700">Observações gerais</Label>
                  <textarea
                    id="sec1-obs"
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão Salvar Alterações da Seção 1 */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={savingPatient}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 h-11 shadow-md shadow-emerald-600/30 gap-2 rounded-xl"
            >
              {savingPatient ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando alterações...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* SEÇÃO 2 — CONSULTAS (Gráfico de evolução de peso + Lista + Botão Nova Consulta) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-6 border-t border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Seção 2
            </span>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Histórico de Consultas e Evolução de Peso
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento gráfico contínuo do peso e medições clínicas em cada retorno.
            </p>
          </div>

          {/* Botão "Nova Consulta" que abre o modal */}
          <Button
            onClick={() => setShowConsultationModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-md shadow-emerald-600/25 gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Consulta
          </Button>
        </div>

        {/* Gráfico de evolução de peso sempre visível em destaque */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Gráfico de Evolução de Peso
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Evolução Temporal
            </span>
          </div>
          <WeightChart consultas={profile.consultas} />
        </div>

        {/* Lista de todas as consultas em ordem cronológica decrescente (mais recente primeiro) */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Consultas Registradas ({cronologicalConsultas.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Mais recentes primeiro</span>
          </div>

          {cronologicalConsultas.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-500">
              Nenhuma consulta registrada para este paciente ainda. Clique no botão acima para registrar a primeira consulta.
            </div>
          ) : (
            <div className="space-y-3">
              {cronologicalConsultas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="p-4 sm:p-5 rounded-2xl border border-emerald-100/90 bg-white hover:border-emerald-200 transition-all shadow-2xs space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Consulta em {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
                    </span>

                    {consulta.proximo_retorno ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Próximo retorno: {new Date(consulta.proximo_retorno).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                        Sem próximo retorno agendado
                      </span>
                    )}
                  </div>

                  {/* Medições: peso, cintura, quadril, % de gordura */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Peso</span>
                      <strong className="text-sm font-black text-slate-900">
                        {consulta.peso ? `${consulta.peso} kg` : '—'}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Cintura</span>
                      <strong className="text-sm font-bold text-slate-800">
                        {consulta.cintura ? `${consulta.cintura} cm` : '—'}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Quadril</span>
                      <strong className="text-sm font-bold text-slate-800">
                        {consulta.quadril ? `${consulta.quadril} cm` : '—'}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">% de Gordura</span>
                      <strong className="text-sm font-bold text-emerald-700">
                        {consulta.percentual_gordura ? `${consulta.percentual_gordura}%` : '—'}
                      </strong>
                    </div>
                  </div>

                  {consulta.observacoes && (
                    <div className="text-slate-600 pt-1 border-t border-slate-100 italic bg-emerald-50/20 p-2.5 rounded-lg">
                      <strong className="text-slate-700 not-italic">Observações: </strong>
                      "{consulta.observacoes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEÇÃO 3 — PLANOS ALIMENTARES */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-6 border-t border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Seção 3
            </span>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Planos Alimentares
            </h2>
            <p className="text-xs text-slate-500">
              Gere e consulte prescrições dietéticas personalizadas para este paciente.
            </p>
          </div>

          {/* Botão "Gerar Plano Alimentar" bem visível (sem funcionalidade ativa por enquanto conforme Prompt 5) */}
          <Button
            type="button"
            onClick={() => {
              alert('A funcionalidade de geração automática com IA do Plano Alimentar será ativada no próximo prompt!')
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-md shadow-emerald-600/25 gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            Gerar Plano Alimentar
          </Button>
        </div>

        {/* Histórico de planos salvos ou mensagem vazia */}
        <div className="space-y-3">
          {(!profile.planos_alimentares || profile.planos_alimentares.length === 0) ? (
            /* Regra do Prompt 5: Se não houver planos salvos ainda, exibir a mensagem "Nenhum plano alimentar gerado ainda" */
            <div className="py-12 px-6 rounded-2xl border border-dashed border-emerald-200 bg-white text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Nenhum plano alimentar gerado ainda
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Os planos nutricionais gerados para {profile.nome} ficarão salvos aqui em ordem cronológica decrescente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.planos_alimentares.map((plano) => {
                const isOpened = selectedPlan?.id === plano.id
                return (
                  <div
                    key={plano.id}
                    className="p-4 sm:p-5 rounded-2xl border border-emerald-100 bg-white hover:border-emerald-200 transition-all shadow-2xs space-y-3"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedPlan(isOpened ? null : plano)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            Plano Nutricional Individualizado
                          </div>
                          <div className="text-xs text-slate-400">
                            Gerado em {new Date(plano.created_at).toLocaleDateString('pt-BR')} às {new Date(plano.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs font-semibold text-emerald-700 gap-1"
                      >
                        {isOpened ? 'Ocultar Conteúdo' : 'Ver Conteúdo Completo'}
                        {isOpened ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Exibição completa do plano quando clicado */}
                    {isOpened && (
                      <div className="pt-3 border-t border-slate-100 animate-in fade-in text-xs space-y-2 bg-slate-50/70 p-4 rounded-xl text-slate-700">
                        {typeof plano.conteudo === 'string' ? (
                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                            {plano.conteudo}
                          </pre>
                        ) : (
                          <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-800 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
                            {JSON.stringify(plano.conteudo, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Nova Consulta */}
      {showConsultationModal && (
        <NewConsultationModal
          patientId={profile.id}
          onClose={() => setShowConsultationModal(false)}
          onSuccess={handleConsultationCreated}
        />
      )}
    </div>
  )
}
export default PatientProfilePage
