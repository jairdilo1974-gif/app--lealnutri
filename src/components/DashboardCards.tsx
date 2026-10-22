import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientWithoutReturn } from '@/services/neonData'
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  CalendarDays,
  UserCheck,
  TrendingUp,
  MessageCircle
} from 'lucide-react'

interface DashboardCardsProps {
  totalPacientes: number
  consultasSemana: number
  pacientesSemRetorno: PatientWithoutReturn[]
  loading?: boolean
  onNavigateToPatients: () => void
  onSelectPatient: (patientId: string) => void
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  totalPacientes,
  consultasSemana,
  pacientesSemRetorno,
  loading = false,
  onNavigateToPatients,
  onSelectPatient,
}) => {
  return (
    <div className="space-y-6">
      {/* Grid superior: Card 1 e Card 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1 — Total de pacientes ativos */}
        <Card className="relative overflow-hidden border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md bg-white group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100/70 transition-all pointer-events-none" />
          
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Card 1 — Cadastro
              </span>
              <CardTitle className="text-base font-bold text-slate-800">
                Total de Pacientes Ativos
              </CardTitle>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <span className="inline-block w-12 h-9 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  totalPacientes
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">
                {totalPacientes === 1 ? 'paciente cadastrado' : 'pacientes cadastrados'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Número total de prontuários vinculados à sua conta de nutricionista.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dados em tempo real
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToPatients}
                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 p-0 h-auto font-semibold gap-1"
              >
                Ver todos
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2 — Consultas da semana */}
        <Card className="relative overflow-hidden border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md bg-white group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-teal-50 rounded-full blur-2xl group-hover:bg-teal-100/70 transition-all pointer-events-none" />

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Card 2 — Agenda
              </span>
              <CardTitle className="text-base font-bold text-slate-800">
                Consultas da Semana
              </CardTitle>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <span className="inline-block w-12 h-9 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  consultasSemana
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">
                {consultasSemana === 1 ? 'consulta nesta semana' : 'consultas nesta semana'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Atendimentos clínicos registrados entre segunda-feira e domingo da semana atual.
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-teal-800">
                <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
                Semana corrente
              </span>
              <span className="text-slate-400 font-normal">
                Sincronizado via Neon
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CARD 3 — Pacientes sem retorno */}
      <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Card 3 — Acompanhamento
                </span>
                {pacientesSemRetorno.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {pacientesSemRetorno.length} {pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'}
                  </span>
                )}
              </div>
              <CardTitle className="text-lg font-bold text-slate-800 mt-1">
                Pacientes sem Retorno
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado.
              </p>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Clique no paciente para ver o perfil completo
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Buscando dados em tempo real no Neon...</p>
            </div>
          ) : pacientesSemRetorno.length === 0 ? (
            /* Regra do Prompt 3: Se não houver pacientes sem retorno, exibir a mensagem "Nenhum paciente sem retorno no momento" */
            <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Nenhum paciente sem retorno no momento
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Excelente! Todos os seus pacientes atendidos estão com consultas recentes ou retornos futuros já agendados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pacientesSemRetorno.map((paciente) => {
                const dataFormatada = paciente.ultima_consulta
                  ? new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR')
                  : 'Data não informada'

                return (
                  <div
                    key={paciente.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {/* Regra do Prompt 3: Cada nome da lista deve ser clicável e redirecionar para o perfil do paciente */}
                        <button
                          type="button"
                          onClick={() => onSelectPatient(paciente.id)}
                          className="font-bold text-sm sm:text-base text-slate-800 hover:text-brand-600 hover:underline transition-colors text-left"
                        >
                          {paciente.nome}
                        </button>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Há {paciente.dias_sem_consulta} dias
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          Última consulta:{' '}
                          <strong className="text-slate-700">{dataFormatada}</strong>
                        </span>
                        {paciente.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {paciente.telefone}
                          </span>
                        )}
                        {paciente.email && (
                          <span className="text-slate-400">
                            {paciente.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {paciente.whatsapp && (
                        <a
                          href={`https://wa.me/55${paciente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${paciente.nome}, aqui é do consultório da sua nutricionista. Como você está? Gostaríamos de agendar seu retorno.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          title="Enviar mensagem pelo WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectPatient(paciente.id)}
                        className="text-xs font-semibold gap-1 text-slate-700 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50"
                      >
                        Ver Perfil
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
