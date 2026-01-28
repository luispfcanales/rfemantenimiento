import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchRequests } from '../lib/api'
import type { RequestItem } from '../lib/api'
import { ExternalLink, Star, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export default function RequestDetail() {
  const { id } = useParams()
  const [item, setItem] = useState<RequestItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchRequests()
      .then((data) => {
        if (!mounted) return
        const found = data.find((r) => String(r.id) === String(id))
        if (found) {
          setItem(found)
          setError(null)
        } else {
          setError('Solicitud no encontrada')
        }
      })
      .catch((e) => {
        if (mounted) setError(e.message ?? 'Error al cargar datos')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <div className="p-6">Cargando...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!item) return null

  const priorityVariant = item.priority >= 3 ? 'destructive' : item.priority === 2 ? 'warning' : 'success'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/requests" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 group">
        <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Volver al listado
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
        <Button
          variant="outline"
          onClick={() => {
            const url = `https://rainforest-uat-ra-210126-27711501.dev.odoo.com/web?debug=1#id=${item.id}&cids=1&menu_id=502&action=766&active_id=14&model=maintenance.request&view_type=form`
            window.open(url, '_blank')
          }}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir en Odoo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
              Información General
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Equipo</p>
                <p className="text-gray-900 mt-1">{item.equipmentName}</p>
                <p className="text-xs text-gray-400">ID: {item.equipmentId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Equipo de Mantenimiento</p>
                <p className="text-gray-900 mt-1">{item.teamName}</p>
                <p className="text-xs text-gray-400">ID: {item.teamId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Etapa</p>
                <div className="mt-1">
                  <Badge variant="outline">{item.stageName}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Prioridad</p>
                <div className="mt-1">
                  <Badge variant={priorityVariant}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: item.priority }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Fechas</h2>
            <div className="space-y-4">
              {item.scheduleDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Programada</p>
                  <p className="text-gray-900">{item.scheduleDate}</p>
                </div>
              )}
              {item.correctiveDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Correctiva</p>
                  <p className="text-gray-900">{item.correctiveDate}</p>
                </div>
              )}
              {!item.scheduleDate && !item.correctiveDate && (
                <p className="text-sm text-gray-400 italic">No hay fechas registradas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

