import { useEffect, useState } from 'react'
import { fetchRequests } from '../lib/api'
import type { RequestItem } from '../lib/api'
import { Eye, Star } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Progress } from '../components/ui/progress'

export default function RequestsList() {
  const [items, setItems] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<RequestItem | null>(null)

  const loadData = () => {
    setLoading(true)
    fetchRequests()
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch((e) => {
        setError(e.message ?? 'Error al cargar datos')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()

    const handleRefresh = () => loadData()
    window.addEventListener('refresh-requests', handleRefresh)

    return () => {
      window.removeEventListener('refresh-requests', handleRefresh)
    }
  }, [])

  if (loading) {
    return <div className="p-6">Cargando solicitudes...</div>
  }
  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Solicitudes de mantenimiento</h1>
      <div className="rounded-md border bg-white shadow-sm">
        <ul className="divide-y">
          {items
            .filter((req) => req.scheduleDate && req.scheduleDate.trim() !== '')
            .map((req) => {
              const priorityVariant =
                req.priority >= 3 ? 'destructive' : req.priority === 2 ? 'warning' : 'success'
              const pct = computeProgress(req.correctiveDate, req.scheduleDate)
              const summary = computeSummary(req.stageName, req.scheduleDate)
              return (
                <li key={req.id} className="px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{req.name}</p>
                      <p className="text-sm text-gray-600">Equipo: {req.teamName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={priorityVariant}>
                        <div className="flex gap-0.5">
                          {Array.from({ length: req.priority }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </Badge>
                      <Badge>{req.stageName}</Badge>
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Ver detalles"
                        onClick={() => setSelected(req)}
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {(pct !== null && (req.stageName === 'In Progress' || req.stageName === 'New Request')) && (
                    <div className="mt-2">
                      <Progress value={pct} />
                      <p className="mt-1 text-xs text-gray-600">{pct.toFixed(1)}% hacia programada</p>
                    </div>
                  )}
                  {summary && (
                    <p className={`mt-1 text-xs ${summary.overdue ? 'text-red-600' : 'text-gray-600'}`}>
                      {summary.text}
                    </p>
                  )}
                </li>
              )
            })}
        </ul>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm text-gray-700 px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium">Equipo</p>
                  <p>{selected.equipmentName}</p>
                  <p className="text-xs text-gray-500">ID {selected.equipmentId}</p>
                </div>
                <div>
                  <p className="font-medium">Equipo</p>
                  <p>{selected.teamName}</p>
                  <p className="text-xs text-gray-500">ID {selected.teamId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium">Etapa</p>
                  <p>{selected.stageName}</p>
                </div>
                <div>
                  <p className="font-medium">Prioridad</p>
                  <Badge variant={priorityVariant(selected.priority)}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: selected.priority }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </Badge>
                </div>
              </div>
              {selected.scheduleDate && (
                <div>
                  <p className="font-medium">Programada</p>
                  <p>{selected.scheduleDate}</p>
                </div>
              )}
              {selected.correctiveDate && (
                <div>
                  <p className="font-medium">Correctiva</p>
                  <p>{selected.correctiveDate}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function priorityVariant(p: number) {
  return p >= 3 ? 'destructive' : p === 2 ? 'warning' : 'success'
}

function computeProgress(correctiveDate?: string, scheduleDate?: string) {
  if (!correctiveDate || !scheduleDate) return null
  const start = toEpoch(correctiveDate)
  const end = toEpoch(scheduleDate)
  if (start == null || end == null || end <= start) return null
  const now = Math.floor(Date.now() / 1000)
  const elapsed = Math.max(0, Math.min(end - start, now - start))
  const pct = (elapsed / (end - start)) * 100
  return Math.max(0, Math.min(100, pct))
}

function toEpoch(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const h = Number(m[4])
  const mi = Number(m[5])
  const se = Number(m[6])
  const ms = Date.UTC(y, mo - 1, d, h, mi, se)
  return Math.floor(ms / 1000)
}

function computeSummary(stageName?: string, scheduleDate?: string) {
  if (!stageName || stageName !== 'New Request' || !scheduleDate) return null
  const sched = toEpoch(scheduleDate)
  if (sched == null) return null
  const now = Math.floor(Date.now() / 1000)
  const diff = sched - now
  const overdue = diff < 0
  const seconds = Math.abs(diff)
  const text = overdue ? `Retraso de ${formatDiff(seconds)}` : `Vence en ${formatDiff(seconds)}`
  return { text, overdue }
}

function formatDiff(seconds: number) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0 && hours > 0) {
    return `${days} ${days === 1 ? 'día' : 'días'} y ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  if (days > 0) {
    return `${days} ${days === 1 ? 'día' : 'días'}`
  }
  if (hours > 0 && minutes > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  return 'menos de 1 minuto'
}
