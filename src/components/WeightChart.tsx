import React, { useState } from 'react'
import { Consultation } from '@/services/neonData'
import { Card, CardContent } from '@/components/ui/card'
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface WeightChartProps {
  consultas: Consultation[]
}

export const WeightChart: React.FC<WeightChartProps> = ({ consultas }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string
    peso: number
    index: number
    x: number
    y: number
  } | null>(null)

  // Filtra consultas que possuem peso informado e ordena cronologicamente (da mais antiga para a mais recente para o gráfico)
  const sortedPoints = [...consultas]
    .filter((c) => c.peso !== undefined && c.peso !== null && !isNaN(c.peso) && c.peso > 0)
    .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime())

  if (sortedPoints.length === 0) {
    return (
      <div className="py-12 px-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/30 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-2xs">
          <Scale className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Nenhuma consulta registrada ainda
        </h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Registre a primeira consulta com peso para começar a visualizar a linha de evolução ponderal do paciente.
        </p>
      </div>
    )
  }

  // Cálculos de variação ponderal
  const primeiroPeso = sortedPoints[0].peso!
  const ultimoPeso = sortedPoints[sortedPoints.length - 1].peso!
  const diferencaPeso = Number((ultimoPeso - primeiroPeso).toFixed(1))
  const pesos = sortedPoints.map((p) => p.peso!)
  const minPeso = Math.min(...pesos)
  const maxPeso = Math.max(...pesos)
  
  // Padding para o eixo Y
  const yPadding = Math.max((maxPeso - minPeso) * 0.15, 2)
  const yMin = Math.max(0, Math.floor(minPeso - yPadding))
  const yMax = Math.ceil(maxPeso + yPadding)
  const yRange = yMax - yMin || 1

  // Dimensões do SVG viewBox
  const width = 760
  const height = 240
  const padX = 55
  const padY = 35
  const chartWidth = width - padX * 2
  const chartHeight = height - padY * 2

  // Gera coordenadas (x, y) de cada ponto
  const coords = sortedPoints.map((p, i) => {
    const x = sortedPoints.length === 1 
      ? padX + chartWidth / 2 
      : padX + (i / (sortedPoints.length - 1)) * chartWidth
    const y = height - padY - ((p.peso! - yMin) / yRange) * chartHeight
    return {
      x,
      y,
      peso: p.peso!,
      date: p.data_consulta,
      index: i,
    }
  })

  // Monta linha e área sob a curva
  const linePath = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaPath = coords.length > 1
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
    : ''

  // Linhas de grade horizontais
  const gridLinesCount = 4
  const gridLines = Array.from({ length: gridLinesCount + 1 }).map((_, i) => {
    const val = yMin + (i / gridLinesCount) * yRange
    const y = height - padY - ((val - yMin) / yRange) * chartHeight
    return { val: Math.round(val * 10) / 10, y }
  })

  return (
    <div className="space-y-3">
      {/* Resumo da evolução */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Peso Inicial:</span>{' '}
            <strong className="text-slate-800 font-bold">{primeiroPeso} kg</strong>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 font-medium">Peso Atual:</span>{' '}
            <strong className="text-emerald-700 font-black text-sm">{ultimoPeso} kg</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {diferencaPeso < 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              Perda de {Math.abs(diferencaPeso)} kg
            </span>
          ) : diferencaPeso > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-full border border-sky-200">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              Ganho de +{diferencaPeso} kg
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <Minus className="w-3.5 h-3.5 text-slate-500" />
              Peso estável
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            ({sortedPoints.length} {sortedPoints.length === 1 ? 'medição' : 'medições'})
          </span>
        </div>
      </div>

      {/* Gráfico SVG Responsivo com animação suave e tooltip interativo */}
      <div className="relative bg-gradient-to-b from-white to-emerald-50/20 rounded-2xl border border-emerald-100 p-4 shadow-sm overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="shadowPoint" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#047857" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Linhas de Grade e Eixo Y */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={padX}
                y1={line.y}
                x2={width - padX}
                y2={line.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padX - 8}
                y={line.y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {line.val}kg
              </text>
            </g>
          ))}

          {/* Área sombreada sob a linha */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#weightAreaGrad)"
              className="transition-all duration-300"
            />
          )}

          {/* Linha de evolução */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#weightLineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos de medição interativos */}
          {coords.map((pt, idx) => {
            const isHovered = hoveredPoint?.index === idx
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Indicador de eixo vertical no hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padY}
                    x2={pt.x}
                    y2={height - padY}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Círculo externo para clique/hover */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 10 : 6}
                  fill={isHovered ? '#10b981' : '#ffffff'}
                  fillOpacity={isHovered ? 0.3 : 1}
                  stroke="#059669"
                  strokeWidth="3"
                  filter="url(#shadowPoint)"
                  className="transition-all duration-150"
                />

                {/* Rótulo de data no Eixo X */}
                <text
                  x={pt.x}
                  y={height - padY + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? 'fill-emerald-800 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {new Date(pt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip flutuante interativo */}
        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-xl flex flex-col items-center gap-0.5 border border-slate-700 animate-in fade-in"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 4}%`,
            }}
          >
            <span className="font-extrabold text-emerald-400 text-sm">
              {hoveredPoint.peso} kg
            </span>
            <span className="text-[10px] text-slate-300">
              {new Date(hoveredPoint.date).toLocaleDateString('pt-BR')}
            </span>
            <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1" />
          </div>
        )}
      </div>
    </div>
  )
}
export default WeightChart
