import React from 'react'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ChevronRight, 
  UserCircle2,
  Sparkles,
  X
} from 'lucide-react'

export type NavTab = 'dashboard' | 'pacientes'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  totalPacientes?: number
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  totalPacientes = 0,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth()

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral da clínica',
    },
    {
      id: 'pacientes' as NavTab,
      label: 'Pacientes',
      icon: Users,
      description: 'Gestão de prontuários',
      badge: totalPacientes > 0 ? totalPacientes : undefined,
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 shadow-sm select-none">
      {/* Top Header: Logo "Nutri APP" conforme especificação do Prompt 3 */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-emerald-50 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/30">
        <Logo size="sm" brandName="Nutri APP" />
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation section */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Principal
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id)
                if (onCloseMobile) onCloseMobile()
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-sm border border-emerald-200/80'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight hidden xl:block">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-200/80 text-emerald-900'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-emerald-600 ml-1" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Online indicator / Neon status */}
      <div className="px-4 py-2 mx-3 mb-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-900">Neon PostgreSQL</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs border border-emerald-100">
          Tempo Real
        </span>
      </div>

      {/* Footer / User Profile section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-sm font-bold text-slate-800 truncate leading-tight">
                {user?.nome || 'Nutricionista'}
              </div>
              <div className="text-xs text-slate-400 truncate leading-tight mt-0.5">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Encerrar sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop and sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
