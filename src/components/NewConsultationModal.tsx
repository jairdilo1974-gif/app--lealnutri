import React, { useState } from 'react'
import { NeonDataService, Consultation } from '@/services/neonData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  X, 
  Calendar, 
  Plus, 
  Loader2, 
  Scale, 
  Clock, 
  Activity,
  AlertCircle
} from 'lucide-react'

interface NewConsultationModalProps {
  patientId: string
  onClose: () => void
  onSuccess: (newConsultation: Consultation) => void
}

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  patientId,
  onClose,
  onSuccess,
}) => {
  // Data da consulta preenchida automaticamente com a data de hoje, editável
  const [dataConsulta, setDataConsulta] = useState(() => new Date().toISOString().split('T')[0])
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const [quadril, setQuadril] = useState('')
  const [percentualGordura, setPercentualGordura] = useState('')
  const [proximoRetorno, setProximoRetorno] = useState('')
  const [observacoes, setObservacoes] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!dataConsulta) {
      setErrorMessage('Por favor, informe a data da consulta.')
      return
    }

    const pesoNum = peso ? parseFloat(peso) : undefined
    if (peso && (isNaN(pesoNum!) || pesoNum! <= 0)) {
      setErrorMessage('Por favor, informe um peso válido.')
      return
    }

    try {
      setSaving(true)
      const nova = await NeonDataService.createConsultation({
        paciente_id: patientId,
        data_consulta: dataConsulta,
        peso: pesoNum,
        cintura: cintura ? parseFloat(cintura) : undefined,
        quadril: quadril ? parseFloat(quadril) : undefined,
        percentual_gordura: percentualGordura ? parseFloat(percentualGordura) : undefined,
        proximo_retorno: proximoRetorno || null,
        observacoes: observacoes.trim() || undefined,
      })

      onSuccess(nova)
      onClose()
    } catch (err: any) {
      console.error('Erro ao salvar consulta:', err)
      setErrorMessage(err.message || 'Erro ao registrar consulta no Neon.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                Nova Consulta
              </h3>
              <span className="text-xs text-slate-400">
                Registro de atendimento e medições corporais
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Data da Consulta e Peso Atual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cons-data" className="text-xs font-bold text-slate-700">
                Data da consulta *
              </Label>
              <Input
                id="cons-data"
                type="date"
                value={dataConsulta}
                onChange={(e) => setDataConsulta(e.target.value)}
                required
                className="h-10 text-xs border-slate-200 focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Preenchida com hoje por padrão</span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cons-peso" className="text-xs font-bold text-slate-700">
                Peso atual em kg
              </Label>
              <div className="relative">
                <Input
                  id="cons-peso"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 72.5"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="h-10 pr-10 text-xs font-semibold border-slate-200 focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Cintura, Quadril e % Gordura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cons-cintura" className="text-xs font-bold text-slate-700">
                Cintura em cm (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="cons-cintura"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 82"
                  value={cintura}
                  onChange={(e) => setCintura(e.target.value)}
                  className="h-10 pr-10 text-xs border-slate-200 focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cons-quadril" className="text-xs font-bold text-slate-700">
                Quadril em cm (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="cons-quadril"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 101"
                  value={quadril}
                  onChange={(e) => setQuadril(e.target.value)}
                  className="h-10 pr-10 text-xs border-slate-200 focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">
                  cm
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cons-gordura" className="text-xs font-bold text-slate-700">
                % de gordura (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="cons-gordura"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 24.5"
                  value={percentualGordura}
                  onChange={(e) => setPercentualGordura(e.target.value)}
                  className="h-10 pr-8 text-xs border-slate-200 focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Próximo Retorno */}
          <div className="space-y-1">
            <Label htmlFor="cons-retorno" className="text-xs font-bold text-slate-700">
              Próximo retorno (seletor de data)
            </Label>
            <Input
              id="cons-retorno"
              type="date"
              value={proximoRetorno}
              onChange={(e) => setProximoRetorno(e.target.value)}
              className="h-10 text-xs border-slate-200 focus:border-emerald-500"
            />
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <Label htmlFor="cons-obs" className="text-xs font-bold text-slate-700">
              Observações (texto livre)
            </Label>
            <textarea
              id="cons-obs"
              rows={3}
              placeholder="Evolução, adesão ao plano, novas metas ou queixas clínicas..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-sm shadow-emerald-600/30"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Salvando consulta...
                </>
              ) : (
                'Salvar consulta'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default NewConsultationModal
