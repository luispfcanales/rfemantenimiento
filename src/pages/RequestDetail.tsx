import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchRequests } from '../lib/api'
import type { RequestItem } from '../lib/api'

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

  return (
    <div className="p-6">
      <Link to="/requests" className="text-sm text-blue-600 hover:underline">
        ← Volver al listado
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{item.name}</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-medium mb-2">Información</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>Equipo: {item.equipmentName} (ID {item.equipmentId})</li>
            <li>Equipo: {item.teamName} (ID {item.teamId})</li>
            <li>Etapa: {item.stageName} (ID {item.stageId})</li>
            <li>Prioridad: {item.priority}</li>
            {item.scheduleDate && <li>Programada: {item.scheduleDate}</li>}
            {item.correctiveDate && <li>Correctiva: {item.correctiveDate}</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
