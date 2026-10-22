import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  brandName?: 'Nutri APP' | 'LEAL NUTRI' | string
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '',
  brandName = 'LEAL NUTRI'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  const isNutriApp = brandName === 'Nutri APP'

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/30 text-white font-extrabold text-lg flex-shrink-0`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/6 h-5/6"
        >
          {/* Health leaf / heart fusion icon */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-black tracking-tight text-slate-900 leading-none ${textSizes[size]}`}>
          {isNutriApp ? (
            <>Nutri <span className="text-brand-600">APP</span></>
          ) : (
            <>LEAL <span className="text-brand-600">NUTRI</span></>
          )}
        </span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">
          Gestão Clínica & Nutrição
        </span>
      </div>
    </div>
  )
}
