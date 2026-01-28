import { useEffect, useState, useMemo } from 'react'
import { fetchRequests, toEpoch } from '../lib/api'
import type { RequestItem } from '../lib/api'
import { Eye, Star, ExternalLink, LayoutGrid, List as ListIcon, AlertCircle, Clock } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent } from '../components/ui/dialog'
import { Progress } from '../components/ui/progress'
import { useFilter } from '../context/FilterContext'
import RequestDetail from './RequestDetail'

type ViewMode = 'list' | 'grid'

const getInitials = (name: string) => {
  if (!name) return '??'
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function MobileInboxItem({ item, onClick, progressColor }: { item: RequestItem; onClick: () => void; progressColor: string }) {
  const initials = getInitials(item.teamName || item.name)
  const colors = [
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-amber-500 text-white',
    'bg-purple-500 text-white',
    'bg-pink-500 text-white',
    'bg-cyan-500 text-white'
  ]
  const colorIndex = (item.teamId || 0) % colors.length
  const avatarBg = colors[colorIndex]

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-4 p-5 border-b border-gray-50 active:bg-gray-50 transition-colors relative"
    >
      {(item.progress ?? 0) > 90 && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      )}
      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-sm shadow-lg flex-shrink-0 ${avatarBg}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-[16px] font-black text-gray-900 truncate tracking-tight">{item.name}</h4>
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap ml-2 font-mono">
            {item.scheduleDate ? item.scheduleDate.split(' ')[0].split('-').slice(1).reverse().join('/') : '---'}
          </span>
        </div>
        <p className="text-[13px] font-bold text-gray-500 truncate mb-1">
          {item.equipmentName || 'Sin equipo'}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-400 truncate flex-1">
            {item.teamName} • Escalamiento {item.priority}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400 space-x-0.5">
              {[...Array(item.priority)].map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-current" />
              ))}
            </div>
            <span className={`text-[11px] font-black ${progressColor}`}>
              {item.progress ?? 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RequestsList() {
  const [items, setItems] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<RequestItem | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('requestsViewMode')
    return (saved as ViewMode) || 'list'
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const { selectedTeamIds, refreshInterval } = useFilter()

  const loadData = (showOverlay = true) => {
    if (showOverlay) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }

    fetchRequests()
      .then((data) => {
        setItems(data)
        setError(null)
        setLastUpdated(new Date())
      })
      .catch((e) => {
        setError(e.message ?? 'Error al cargar datos')
      })
      .finally(() => {
        setLoading(false)
        setIsRefreshing(false)
      })
  }

  useEffect(() => {
    localStorage.setItem('requestsViewMode', viewMode)
  }, [viewMode])

  useEffect(() => {
    loadData(true)

    const handleRefresh = () => loadData(false)
    window.addEventListener('refresh-requests', handleRefresh)

    // Setup initial time remaining
    if (refreshInterval > 0) {
      setTimeRemaining(refreshInterval * 60)
    }

    let intervalId: any = null
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        loadData(false)
        setTimeRemaining(refreshInterval * 60)
      }, refreshInterval * 60 * 1000)
    }

    const timerId = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      window.removeEventListener('refresh-requests', handleRefresh)
      if (intervalId) clearInterval(intervalId)
      clearInterval(timerId)
    }
  }, [refreshInterval])

  const filteredItems = useMemo(() => {
    const activeItems = items.filter((item) => item.stageName !== 'Repaired' && item.scheduleDate)
    const teamsFiltered = selectedTeamIds.size === 0
      ? activeItems
      : activeItems.filter((item) => selectedTeamIds.has(item.teamId))

    const now = Math.floor(Date.now() / 1000)
    const itemsWithProgress = teamsFiltered.map(item => {
      let progress = 0
      if (item.correctiveDate && item.scheduleDate) {
        const start = toEpoch(item.correctiveDate)
        const end = toEpoch(item.scheduleDate)
        if (start !== null && end !== null && end > start) {
          const elapsed = Math.max(0, Math.min(end - start, now - start))
          progress = Math.round((elapsed / (end - start)) * 100)
        }
      }
      return { ...item, progress }
    })

    return [...itemsWithProgress].sort((a, b) => {
      const aEpoch = a.scheduleDate ? toEpoch(a.scheduleDate) : null
      const bEpoch = b.scheduleDate ? toEpoch(b.scheduleDate) : null

      if (aEpoch === null && bEpoch === null) return 0
      if (aEpoch === null) return 1
      if (bEpoch === null) return -1

      const aDiff = aEpoch - now
      const bDiff = bEpoch - now

      const aOverdue = aDiff < 0
      const bOverdue = bDiff < 0

      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      return aDiff - bDiff
    })
  }, [items, selectedTeamIds])

  const getOverdueInfo = (item: RequestItem) => {
    if (!item.scheduleDate) return null
    const sched = toEpoch(item.scheduleDate)
    if (sched == null) return null
    const now = Math.floor(Date.now() / 1000)
    const diff = sched - now
    const overdue = diff < 0
    const seconds = Math.abs(diff)

    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)

    let text = ''
    if (overdue) {
      text = `Vencido hace ${days > 0 ? `${days}d ` : ''}${hours}h`
    } else {
      text = `Vence en ${days > 0 ? `${days}d ` : ''}${hours}h`
    }
    return { text, overdue }
  }

  const getItemColors = (progress: number = 0) => {
    if (progress > 95) return {
      bg: 'bg-red-100/40',
      border: 'border-red-200/50',
      hover: 'hover:bg-red-100/60',
      text: 'text-red-700'
    }
    if (progress > 85) return {
      bg: 'bg-amber-50/40',
      border: 'border-amber-100/50',
      hover: 'hover:bg-amber-50/60',
      text: 'text-amber-600'
    }
    return {
      bg: 'bg-green-50/30',
      border: 'border-green-100/40',
      hover: 'hover:bg-green-50/50',
      text: 'text-green-600'
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Cargando solicitudes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center max-w-lg mx-auto mt-12 shadow-sm">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Error de conexión</h3>
        <p className="text-red-700 text-sm mb-6">{error}</p>
        <Button onClick={() => loadData()} variant="outline" className="border-red-200 hover:bg-red-100 text-red-700 rounded-xl">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      {/* Refresh Progress Bar */}
      {refreshInterval > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-100/30">
          <div
            className="h-full bg-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-1000 ease-linear"
            style={{ width: `${(timeRemaining / (refreshInterval * 60)) * 100}%` }}
          />
        </div>
      )}
      <header className="md:hidden flex flex-col gap-4 mb-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-inner shadow-black/10">
              L
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bandeja de entrada</h1>
          </div>
        </div>
      </header>

      <header className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mantenimiento</h1>
          <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            {filteredItems.length} solicitudes activas
          </p>
        </div>

        <div className="flex items-center gap-6">
          {(isRefreshing || lastUpdated) && (
            <div className="hidden sm:flex flex-col items-end gap-1">
              {isRefreshing ? (
                <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                  <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Actualizando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Actualizado {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 backdrop-blur-sm shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-md border border-gray-100 scale-105'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <ListIcon className="h-4 w-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-md border border-gray-100 scale-105'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Divs
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Inbox View - Only visible on small screens */}
      <div className="md:hidden">
        <div className="bg-white border-y border-gray-100 overflow-hidden divide-y divide-gray-50 mb-8">
          {filteredItems.map((item) => (
            <MobileInboxItem
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
              progressColor={item.progress > 95 ? 'text-red-500' : 'text-blue-500'}
            />
          ))}
        </div>
      </div>

      <div className={`hidden md:block transition-all duration-700 ${isRefreshing ? 'blur-sm opacity-60 scale-[0.99] pointer-events-none' : 'blur-0 opacity-100 scale-100'}`}>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Sin resultados</h3>
            <p className="text-gray-500 mt-2">No hay solicitudes que coincidan con tus filtros.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden transition-all duration-500">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Prioridad</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Solicitud / Equipo</th>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Urgencia de Mantenimiento</th>
                      <th className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredItems.map((item) => {
                      const overdueInfo = getOverdueInfo(item)
                      const colors = getItemColors(item.progress)
                      return (
                        <tr key={item.id} className={`group ${colors.hover} transition-all duration-300 ${colors.bg}`}>
                          <td className="px-8 py-3 align-top">
                            <div className="flex text-amber-400 space-x-0.5">
                              {[...Array(item.priority)].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-2.5 align-top">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-[11px] font-medium text-gray-400 mt-0.5 uppercase tracking-wider">
                                {item.teamName} • {item.equipmentName}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-2.5 align-top">
                            <div className="space-y-1">
                              <div className="w-40">
                                <div className="flex justify-between items-center mb-0.5 px-0.5">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.progress}%</span>
                                  <span className="text-[9px] font-bold text-gray-600 tracking-tight">{item.stageName}</span>
                                </div>
                                <Progress
                                  value={item.progress}
                                  className="h-1.5 rounded-full bg-gray-100"
                                />
                              </div>
                              {overdueInfo && (
                                <p className={`text-[10px] font-black uppercase tracking-widest ${overdueInfo.overdue ? 'text-red-500' : 'text-amber-500'}`}>
                                  {overdueInfo.text}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-3 align-top text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelected(item)}
                                className="h-10 w-10 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-lg rounded-xl transition-all duration-300"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-gray-400 hover:text-orange-500 hover:bg-white hover:shadow-lg rounded-xl transition-all duration-300"
                                onClick={() => window.open(`https://rainforest-uat-ra-210126-27711501.dev.odoo.com/web?debug=1#id=${item.id}&cids=1&menu_id=502&action=766&active_id=14&model=maintenance.request&view_type=form`, '_blank')}
                              >
                                <ExternalLink className="h-5 w-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredItems.map((item) => {
              const overdueInfo = getOverdueInfo(item)
              const colors = getItemColors(item.progress)
              return (
                <div
                  key={item.id}
                  className={`${colors.bg} rounded-[2.5rem] border ${colors.border} shadow-xl shadow-gray-200/20 p-8 flex flex-col h-full group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex space-x-0.5 text-amber-400">
                      {[...Array(item.priority)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <Badge className="bg-gray-50 text-gray-600 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {item.stageName}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-8">
                    {item.teamName}
                  </p>

                  <div className="mt-auto space-y-6">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-end px-1">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[.2em]">Prioridad Mantenimiento</span>
                        <span className="text-xs font-black text-gray-900">{item.progress}%</span>
                      </div>
                      <Progress
                        value={item.progress}
                        className="h-2.5 rounded-full bg-gray-50 shadow-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      {overdueInfo && (
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${overdueInfo.overdue ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${overdueInfo.overdue ? 'text-red-500' : 'text-gray-900'}`}>
                            {overdueInfo.text}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(item)}
                          className="h-9 w-9 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                          onClick={() => window.open(`https://rainforest-uat-ra-210126-27711501.dev.odoo.com/web?debug=1#id=${item.id}&cids=1&menu_id=502&action=766&active_id=14&model=maintenance.request&view_type=form`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-white animate-in zoom-in-95 duration-300">
            {selected && <RequestDetail item={selected} onClose={() => setSelected(null)} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

}
