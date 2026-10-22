import React, { useState, useEffect } from 'react'
import { NeonDataService, Patient } from '@/services/neonData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Loader2, 
  ArrowRight,
  Target,
  Pencil
} from 'lucide-react'

interface PatientsViewProps {
  nutriId: string
  onSelectPatient: (patientId: string) => void
  onNavigateToNewPatient: () => void
  onEditPatient?: (patient: Patient) => void
  onPatientAdded?: () => void
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  nutriId,
  onSelectPatient,
  onNavigateToNewPatient,
  onEditPatient,
  onPatientAdded,
}) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await NeonDataService.getPatients(nutriId)
      setPatients(data)
    } catch (err) {
      console.error('Erro ao listar pacientes do Neon:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [nutriId])

  // Filtro de busca por nome no topo da listagem
  const filtered = patients.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      p.nome.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.telefone && p.telefone.includes(term))
    )
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header com Ações: Título e Botão "Novo Paciente" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            Pacientes Cadastrados
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Listagem de todos os pacientes cadastrados pela nutricionista logada no Neon DB.
          </p>
        </div>

        {/* Regra do Prompt 4: Botão "Novo Paciente" que redireciona para o formulário de cadastro */}
        <Button
          onClick={onNavigateToNewPatient}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-md shadow-emerald-600/20 gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Campo de busca por nome no topo da listagem */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Buscar por nome do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 text-sm bg-white border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <div className="text-xs text-slate-600 font-medium px-4 py-3 bg-white rounded-xl border border-emerald-100 shadow-sm whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-1.5">
          <span>Cadastrados:</span>
          <strong className="text-emerald-700 font-extrabold">{patients.length}</strong>
        </div>
      </div>

      {/* Lista de Pacientes em conformidade estrita com o Prompt 4 */}
      <Card className="border-emerald-100 shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Buscando pacientes no Neon...</p>
            </div>
          ) : filtered.length === 0 ? (
            /* Regra do Prompt 4: "Se não houver pacientes cadastrados, exibir a mensagem 'Nenhum paciente cadastrado ainda'" */
            <div className="py-20 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {searchTerm ? 'Nenhum paciente encontrado na busca' : 'Nenhum paciente cadastrado ainda'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-5">
                {searchTerm
                  ? 'Verifique se digitou o nome corretamente ou limpe o campo de busca.'
                  : 'Comece cadastrando seu primeiro paciente com dados pessoais, clínicos e hábitos.'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={onNavigateToNewPatient}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-md shadow-emerald-600/20 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Primeiro Paciente
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-emerald-50">
              {filtered.map((patient) => {
                // Formatação do Objetivo
                const objetivosTexto = patient.objetivos && patient.objetivos.length > 0
                  ? patient.objetivos.join(', ')
                  : patient.objetivo_texto || 'Objetivo não informado'

                // Formatação da Última Consulta
                const dataUltimaConsultaFormatada = patient.ultima_consulta
                  ? new Date(patient.ultima_consulta).toLocaleDateString('pt-BR')
                  : 'Sem consulta registrada'

                return (
                  /* Regra do Prompt 4: Cada paciente da lista deve ser clicável e redirecionar para o perfil do paciente */
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar Inicial */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {patient.nome.charAt(0).toUpperCase()}
                      </div>

                      {/* Regra do Prompt 4: Cada paciente exibe: nome, objetivo e data da última consulta */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {patient.nome}
                          </h4>
                          {patient.sexo && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                              {patient.sexo}
                            </span>
                          )}
                        </div>

                        {/* Objetivo em destaque */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Target className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="text-slate-500">Objetivo:</span>
                          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
                            {objetivosTexto}
                          </span>
                        </div>

                        {/* Data da Última Consulta */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Última consulta:</span>
                            <strong className="text-slate-700 font-bold">{dataUltimaConsultaFormatada}</strong>
                          </span>

                          {patient.telefone && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {patient.telefone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação direta */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {onEditPatient && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditPatient(patient)
                          }}
                          className="text-xs font-semibold gap-1.5 border-emerald-200 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-xl"
                          title="Editar ficha e dados clínicos"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectPatient(patient.id)
                        }}
                        className="text-xs font-semibold gap-1.5 border-emerald-200 text-emerald-850 hover:text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100/60 rounded-xl"
                      >
                        Abrir Perfil
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
export default PatientsView
