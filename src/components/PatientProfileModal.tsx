import React, { useState, useEffect } from 'react'
import { NeonDataService, PatientDetail } from '@/services/neonData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Plus, 
  Loader2, 
  Clock, 
  AlertCircle,
  HeartPulse,
  Apple,
  Pencil
} from 'lucide-react'

interface PatientProfileModalProps {
  patientId: string
  nutriId: string
  onClose: () => void
  onEditPatient?: (patient: PatientDetail) => void
  onConsultationCreated?: () => void
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patientId,
  nutriId,
  onClose,
  onEditPatient,
  onConsultationCreated,
}) => {
  const [profile, setProfile] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewConsultation, setShowNewConsultation] = useState(false)
  const [savingConsultation, setSavingConsultation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states para nova consulta
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split('T')[0])
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const [quadril, setQuadril] = useState('')
  const [percentualGordura, setPercentualGordura] = useState('')
  const [proximoRetorno, setProximoRetorno] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await NeonDataService.getPatientProfile(patientId, nutriId)
      setProfile(data)
    } catch {
      setError('Erro ao carregar dados do prontuário no Neon.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [patientId, nutriId])

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dataConsulta) return

    try {
      setSavingConsultation(true)
      await NeonDataService.createConsultation({
        paciente_id: patientId,
        data_consulta: dataConsulta,
        peso: peso ? parseFloat(peso) : undefined,
        cintura: cintura ? parseFloat(cintura) : undefined,
        quadril: quadril ? parseFloat(quadril) : undefined,
        percentual_gordura: percentualGordura ? parseFloat(percentualGordura) : undefined,
        proximo_retorno: proximoRetorno || null,
        observacoes: observacoes || undefined,
      })

      // Limpar form
      setPeso('')
      setCintura('')
      setQuadril('')
      setPercentualGordura('')
      setProximoRetorno('')
      setObservacoes('')
      setShowNewConsultation(false)

      await loadProfile()
      if (onConsultationCreated) {
        onConsultationCreated()
      }
    } catch (err: any) {
      alert('Erro ao registrar consulta: ' + (err.message || 'Tente novamente'))
    } finally {
      setSavingConsultation(false)
    }
  }

  // Cálculo de IMC a partir de peso_inicial e altura
  const imc = profile?.peso_inicial && profile?.altura
    ? (profile.peso_inicial / (profile.altura * profile.altura)).toFixed(1)
    : null

  // Cálculo de idade
  const idade = profile?.data_nascimento ? (() => {
    const birth = new Date(profile.data_nascimento)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  })() : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header do Perfil do Paciente */}
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              {profile?.nome ? profile.nome.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-800 leading-tight">
                  {profile?.nome || 'Perfil do Paciente'}
                </h2>
                {profile?.sexo && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    {profile.sexo}
                  </span>
                )}
                {idade !== null && (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {idade} anos
                  </span>
                )}
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                Prontuário clínico ativo &bull; Sincronizado ao Neon PostgreSQL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile && onEditPatient && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onEditPatient(profile)
                }}
                className="gap-1.5 text-xs font-bold border-emerald-200 text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/60 rounded-xl shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar Ficha
              </Button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Fechar prontuário"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Prontuário */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Carregando prontuário...</p>
            </div>
          ) : !profile ? (
            <div className="py-12 text-center text-slate-500">
              {error || 'Paciente não encontrado.'}
            </div>
          ) : (
            <>
              {/* Quick Info Grid: Peso, Altura, IMC, Total Consultas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Peso Atual
                  </span>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {profile.peso_inicial ? `${profile.peso_inicial} kg` : '—'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Altura
                  </span>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {profile.altura ? `${(profile.altura * 100).toFixed(0)} cm (${profile.altura} m)` : '—'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    IMC
                  </span>
                  <div className="text-base font-black text-emerald-700 mt-0.5">
                    {imc ? `${imc} kg/m²` : '—'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Consultas
                  </span>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {profile.consultas.length} {profile.consultas.length === 1 ? 'atendimento' : 'atendimentos'}
                  </div>
                </div>
              </div>

              {/* Aba 1 — Dados Pessoais & Contatos */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Contato e Dados Pessoais
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  {profile.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>Telefone:</strong> {profile.telefone}</span>
                    </div>
                  )}
                  {profile.whatsapp && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>WhatsApp:</strong> {profile.whatsapp}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>Email:</strong> {profile.email}</span>
                    </div>
                  )}
                  {profile.data_nascimento && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>Nascimento:</strong> {new Date(profile.data_nascimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aba 2 — Dados Clínicos & Histórico */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  Histórico Clínico e Objetivos
                </div>

                <div className="space-y-2 text-xs">
                  {/* Objetivos */}
                  <div>
                    <strong className="text-slate-800">Objetivo(s):</strong>{' '}
                    {profile.objetivos && profile.objetivos.length > 0 ? (
                      <span className="inline-flex flex-wrap gap-1 mt-1">
                        {profile.objetivos.map((o, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                            {o}
                          </span>
                        ))}
                      </span>
                    ) : 'Não informado'}
                    {profile.objetivo_texto && (
                      <p className="mt-1 text-slate-600 italic">"{profile.objetivo_texto}"</p>
                    )}
                  </div>

                  {/* Nível de Atividade */}
                  {profile.nivel_atividade && (
                    <div>
                      <strong className="text-slate-800">Nível de atividade:</strong>{' '}
                      <span className="text-slate-700">{profile.nivel_atividade}</span>
                    </div>
                  )}

                  {/* Patologias */}
                  {profile.patologias && profile.patologias.length > 0 && (
                    <div>
                      <strong className="text-slate-800">Patologias / Condições:</strong>{' '}
                      <span className="inline-flex flex-wrap gap-1 mt-1">
                        {profile.patologias.map((p, idx) => (
                          <span key={idx} className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-medium">
                            {p}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {/* Restrições Alimentares */}
                  {profile.restricoes_alimentares && profile.restricoes_alimentares.length > 0 && (
                    <div>
                      <strong className="text-slate-800">Restrições alimentares:</strong>{' '}
                      <span className="inline-flex flex-wrap gap-1 mt-1">
                        {profile.restricoes_alimentares.map((r, idx) => (
                          <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                            {r}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {/* Alergias */}
                  {profile.alergias && profile.alergias.length > 0 && (
                    <div>
                      <strong className="text-slate-800">Alergias alimentares:</strong>{' '}
                      <span className="inline-flex flex-wrap gap-1 mt-1">
                        {profile.alergias.map((a, idx) => (
                          <span key={idx} className="bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md font-medium">
                            {a}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {/* Medicamentos e Suplementos */}
                  {profile.medicamentos && (
                    <div>
                      <strong className="text-slate-800">Medicamentos contínuos:</strong>{' '}
                      <span className="text-slate-700">{profile.medicamentos}</span>
                    </div>
                  )}

                  {profile.suplementos && (
                    <div>
                      <strong className="text-slate-800">Suplementos:</strong>{' '}
                      <span className="text-slate-700">{profile.suplementos}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aba 3 — Hábitos e Rotina */}
              {(profile.refeicoes_por_dia || profile.horario_acorda || profile.horario_dorme || profile.litros_agua || profile.atividade_fisica || profile.observacoes) && (
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    Hábitos e Rotina
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    {profile.refeicoes_por_dia && (
                      <div>
                        <strong>Refeições/dia:</strong> {profile.refeicoes_por_dia}
                      </div>
                    )}
                    {profile.litros_agua && (
                      <div>
                        <strong>Consumo de água:</strong> {profile.litros_agua} litros
                      </div>
                    )}
                    {profile.horario_acorda && (
                      <div>
                        <strong>Horário que acorda:</strong> {profile.horario_acorda}
                      </div>
                    )}
                    {profile.horario_dorme && (
                      <div>
                        <strong>Horário que dorme:</strong> {profile.horario_dorme}
                      </div>
                    )}
                    {profile.atividade_fisica && (
                      <div className="sm:col-span-2">
                        <strong>Atividade física:</strong> Sim {profile.atividade_fisica_descricao ? `(${profile.atividade_fisica_descricao})` : ''}
                      </div>
                    )}
                    {profile.observacoes && (
                      <div className="sm:col-span-2 italic text-slate-500 pt-1 border-t border-slate-100">
                        <strong>Observações gerais:</strong> "{profile.observacoes}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seção de Consultas e Atendimentos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Histórico de Consultas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Registro de atendimentos e retornos agendados
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setShowNewConsultation(!showNewConsultation)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 text-xs rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {showNewConsultation ? 'Cancelar' : 'Nova Consulta'}
                  </Button>
                </div>

                {/* Form de Nova Consulta */}
                {showNewConsultation && (
                  <form
                    onSubmit={handleCreateConsultation}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-4 animate-in fade-in"
                  >
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Registrar Atendimento Clínico
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="c-data" className="text-xs">Data da consulta *</Label>
                        <Input
                          id="c-data"
                          type="date"
                          value={dataConsulta}
                          onChange={(e) => setDataConsulta(e.target.value)}
                          required
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="c-peso" className="text-xs">Peso aferido (kg)</Label>
                        <Input
                          id="c-peso"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 72.5"
                          value={peso}
                          onChange={(e) => setPeso(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="c-retorno" className="text-xs">Próximo retorno (opcional)</Label>
                        <Input
                          id="c-retorno"
                          type="date"
                          value={proximoRetorno}
                          onChange={(e) => setProximoRetorno(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="c-cintura" className="text-xs">Cintura (cm)</Label>
                        <Input
                          id="c-cintura"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 80"
                          value={cintura}
                          onChange={(e) => setCintura(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="c-quadril" className="text-xs">Quadril (cm)</Label>
                        <Input
                          id="c-quadril"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 98"
                          value={quadril}
                          onChange={(e) => setQuadril(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="c-gordura" className="text-xs">% Gordura</Label>
                        <Input
                          id="c-gordura"
                          type="number"
                          step="0.1"
                          placeholder="Ex: 22.4"
                          value={percentualGordura}
                          onChange={(e) => setPercentualGordura(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="c-obs" className="text-xs">Observações clínicas</Label>
                      <Input
                        id="c-obs"
                        type="text"
                        placeholder="Evolução, ajustes no plano alimentar, adesão..."
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewConsultation(false)}
                        disabled={savingConsultation}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={savingConsultation}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        {savingConsultation ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar Consulta'
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Lista de Consultas */}
                {profile.consultas.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                    Nenhuma consulta registrada para este paciente ainda. Clique em "+ Nova Consulta" para registrar o primeiro atendimento.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.consultas.map((consulta) => (
                      <div
                        key={consulta.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 transition-colors space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            Consulta em {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
                          </span>

                          {consulta.proximo_retorno ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              Retorno agendado: {new Date(consulta.proximo_retorno).toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" />
                              Sem retorno agendado
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                          {consulta.peso && <span><strong>Peso:</strong> {consulta.peso} kg</span>}
                          {consulta.cintura && <span><strong>Cintura:</strong> {consulta.cintura} cm</span>}
                          {consulta.quadril && <span><strong>Quadril:</strong> {consulta.quadril} cm</span>}
                          {consulta.percentual_gordura && <span><strong>% Gordura:</strong> {consulta.percentual_gordura}%</span>}
                        </div>

                        {consulta.observacoes && (
                          <p className="text-slate-500 italic pt-1 border-t border-slate-50">
                            "{consulta.observacoes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            {profile && onEditPatient && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onEditPatient(profile)
                }}
                className="gap-1.5 text-xs font-bold border-emerald-200 text-emerald-800 hover:text-emerald-900 hover:bg-emerald-100/60 rounded-xl"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar Ficha do Paciente
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Fechar Prontuário
          </Button>
        </div>
      </div>
    </div>
  )
}
export default PatientProfileModal
