export type Team = {
  id: number
  name: string
}

export type RawRequest = {
  id: number
  name: string
  maintenance_team_id: [number, string]
  stage_id: [number, string]
  priority: string
  schedule_date: string | false
  equipment_id: [number, string]
  corrective_date: string
}

export type ApiResponseItem = {
  team?: Team
  requests?: unknown
  total?: number
}

export type RequestItem = {
  id: number
  name: string
  teamId: number
  teamName: string
  stageId: number
  stageName: string
  priority: number
  scheduleDate?: string
  equipmentId: number
  equipmentName: string
  correctiveDate?: string
}

export async function fetchRequests(): Promise<RequestItem[]> {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/mantenimiento/requests'
  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: unknown = await res.json()
  const items: RequestItem[] = []
  if (!Array.isArray(data)) return items
  for (const group of data as ApiResponseItem[]) {
    const team = group.team ?? { id: 0, name: '' }
    const groupRequests = Array.isArray(group.requests) ? group.requests : []
    for (const req of groupRequests) {
      if (!req || !('id' in req) || req.id === undefined) continue
      const r = req as RawRequest
      items.push({
        id: r.id,
        name: r.name,
        teamId: team.id ?? r.maintenance_team_id?.[0],
        teamName: team.name ?? r.maintenance_team_id?.[1],
        stageId: r.stage_id?.[0],
        stageName: r.stage_id?.[1],
        priority: Number(r.priority ?? 0),
        scheduleDate: r.schedule_date || undefined,
        equipmentId: r.equipment_id?.[0],
        equipmentName: r.equipment_id?.[1],
        correctiveDate: r.corrective_date || undefined,
      })
    }
  }
  return items
}
