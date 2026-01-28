import { Star, ExternalLink, Calendar, Info, Wrench, ShieldCheck, Clock } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import type { RequestItem } from '../lib/api'

type Props = {
  item: RequestItem
  onClose?: () => void
}

export default function RequestDetail({ item, onClose }: Props) {
  // Urgency color logic
  const getProgressColor = (v: number) => {
    if (v > 95) return 'text-red-500'
    if (v > 85) return 'text-amber-500'
    return 'text-green-500'
  }

  const getProgressLabel = (v: number) => {
    if (v > 95) return 'Mantenimiento Urgente'
    if (v > 85) return 'Mantenimiento Pendiente'
    return 'Mantenimiento Programado'
  }

  const getBgColor = (v: number = 0) => {
    if (v > 95) return 'bg-red-100/40'
    if (v > 85) return 'bg-amber-50/30'
    return 'bg-green-50/20'
  }

  return (
    <div className={`text-gray-900 rounded-2xl sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-500 ${getBgColor(item.progress)}`}>
      {/* Header Section */}
      <div className="relative h-40 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_70%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 sm:pb-6">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                {item.teamName}
              </Badge>
              <div className="flex text-amber-400 space-x-0.5">
                {[...Array(item.priority)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
              {item.name}
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
          >
            <span className="text-xl">×</span>
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 flex items-center gap-3 sm:gap-4">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Equipo</p>
              <h4 className="text-sm font-bold text-gray-900">{item.equipmentName || 'Sin asignar'}</h4>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 flex items-center gap-3 sm:gap-4">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estado</p>
              <h4 className="text-sm font-bold text-gray-900">{item.stageName}</h4>
            </div>
          </div>
        </div>

        {/* Urgency Section */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Urgencia</h3>
            <span className={`text-2xl sm:text-3xl font-black ${getProgressColor(item.progress || 0)}`}>
              {item.progress || 0}%
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold text-gray-600">{getProgressLabel(item.progress || 0)}</span>
            </div>
            <Progress
              value={item.progress || 0}
              className="h-3 rounded-full bg-gray-100"
            />
            <p className="text-[10px] font-bold text-gray-400 text-center italic">
              Nivel de necesidad basado en el cronograma programado
            </p>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cronología</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100/50 flex gap-3 sm:gap-4">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reporte</p>
                <p className="text-sm font-bold text-gray-900">{item.correctiveDate || '---'}</p>
              </div>
            </div>

            <div className="bg-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100/50 flex gap-3 sm:gap-4">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Límite</p>
                <p className="text-sm font-bold text-gray-900">{item.scheduleDate || '---'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 bg-white/40 border-t border-gray-100 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            <Info className="h-3.5 w-3.5 text-blue-400" />
            Sincronizado con Odoo
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto px-4 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-gray-200 hover:bg-white transition-all order-2 sm:order-1"
            >
              Cerrar
            </Button>
            <Button
              className="w-full sm:w-auto bg-gray-900 text-white hover:bg-black px-4 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 order-1 sm:order-2"
              onClick={() => window.open(`https://rainforest-uat-ra-210126-27711501.dev.odoo.com/web?debug=1#id=${item.id}&cids=1&menu_id=502&action=766&active_id=14&model=maintenance.request&view_type=form`, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en Odoo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


