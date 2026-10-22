import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { NeonDataService, DashboardStats, Patient } from '@/services/neonData'
import { Sidebar, NavTab } from '@/components/Sidebar'
import { DashboardCards } from '@/components/DashboardCards'
import { PatientsView } from '@/components/PatientsView'
import { NewPatientPage } from '@/components/NewPatientPage'
import { PatientProfilePage } from '@/components/PatientProfilePage'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  RefreshCw, 
  Sparkles
} from 'lucide-react'

export type ExtendedNavTab = NavTab | 'novo-paciente' | 'perfil-paciente'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState<ExtendedNavTab>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null)
  const [nutriDbId, setNutriDbId] = useState<string | null>(null)

  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Resolve o ID exato da nutricionista na tabela public.nutricionistas
  useEffect(() => {
    if (user) {
      NeonDataService.resolveNutricionistaId(user.id, user.email)
        .then((id) => setNutriDbId(id))
        .catch((err) => {
          console.warn('Erro ao resolver ID da nutricionista:', err)
          setNutriDbId(user.id)
        })
    }
  }, [user])

  // Carrega as estatísticas do Neon em tempo real
  const fetchStats = useCallback(async () => {
    if (!nutriDbId) return

    try {
      const data = await NeonDataService.getDashboardStats(nutriDbId)
      setStats(data)
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard no Neon:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [nutriDbId])

  useEffect(() => {
    if (nutriDbId) {
      setLoading(true)
      fetchStats()
    }
  }, [nutriDbId, fetchStats])

  const handleManualRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  // Obter data atual formatada
  const formattedToday = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Menu lateral fixo com logo "Nutri APP" mantido em todas as telas (Prompt 3, 4 e 5) */}
      <Sidebar
        currentTab={currentTab === 'dashboard' ? 'dashboard' : 'pacientes'}
        onSelectTab={(tab) => {
          setSelectedPatientId(null)
          setCurrentTab(tab)
        }}
        totalPacientes={stats.totalPacientes}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Conteúdo Principal — Deslocado à direita da sidebar fixa no desktop */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex flex-col text-left">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700">
                  {currentTab === 'dashboard'
                    ? 'Painel de Controle'
                    : currentTab === 'novo-paciente'
                    ? 'Cadastro de Paciente'
                    : currentTab === 'perfil-paciente'
                    ? 'Perfil do Paciente'
                    : 'Listagem de Pacientes'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800 capitalize leading-tight">
                  {formattedToday}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                className="gap-2 text-xs font-semibold text-slate-600 border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Sincronizando...' : 'Atualizar Dados'}
                </span>
              </Button>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700">Dra. {user?.nome || 'Nutricionista'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {currentTab === 'dashboard' && (
            <>
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10">
                <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-emerald-100 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Conectada ao Neon DB &bull; Consultório Nutricional</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Olá, Dra. {user?.nome || 'Nutricionista'}!
                  </h1>
                  <p className="mt-2 text-emerald-100 text-xs sm:text-sm leading-relaxed">
                    Aqui está a visão consolidada em tempo real dos seus pacientes, consultas da semana e monitoramento de retornos.
                  </p>
                </div>
              </div>

              {/* Os 3 Cards de Informação exigidos pelo Prompt 3 */}
              <DashboardCards
                totalPacientes={stats.totalPacientes}
                consultasSemana={stats.consultasSemana}
                pacientesSemRetorno={stats.pacientesSemRetorno}
                loading={loading}
                onNavigateToPatients={() => {
                  setSelectedPatientId(null)
                  setCurrentTab('pacientes')
                }}
                onSelectPatient={(patientId) => {
                  setSelectedPatientId(patientId)
                  setCurrentTab('perfil-paciente')
                }}
              />
            </>
          )}

          {currentTab === 'pacientes' && nutriDbId && (
            /* Visualização e Listagem de Pacientes (Prompt 4) */
            <PatientsView
              nutriId={nutriDbId}
              onSelectPatient={(patientId) => {
                setSelectedPatientId(patientId)
                setCurrentTab('perfil-paciente')
              }}
              onNavigateToNewPatient={() => {
                setPatientToEdit(null)
                setCurrentTab('novo-paciente')
              }}
              onEditPatient={(patient) => {
                setPatientToEdit(patient)
                setCurrentTab('novo-paciente')
              }}
              onPatientAdded={() => {
                fetchStats()
              }}
            />
          )}

          {currentTab === 'novo-paciente' && nutriDbId && (
            /* Formulário de Cadastro / Edição — 3 Abas */
            <NewPatientPage
              nutriId={nutriDbId}
              patientToEdit={patientToEdit}
              onCancel={() => {
                setPatientToEdit(null)
                setCurrentTab(selectedPatientId ? 'perfil-paciente' : 'pacientes')
              }}
              onSuccess={(savedPatient) => {
                fetchStats()
                setPatientToEdit(null)
                // Redireciona para o perfil do paciente recém cadastrado ou editado
                setSelectedPatientId(savedPatient.id)
                setCurrentTab('perfil-paciente')
              }}
            />
          )}

          {currentTab === 'perfil-paciente' && selectedPatientId && nutriDbId && (
            /* Página de Perfil do Paciente + Consultas (Prompt 5) */
            <PatientProfilePage
              patientId={selectedPatientId}
              nutriId={nutriDbId}
              onBack={() => {
                setSelectedPatientId(null)
                setCurrentTab('pacientes')
              }}
              onPatientUpdated={() => {
                fetchStats()
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
export default Dashboard
