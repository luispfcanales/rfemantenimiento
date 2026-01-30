export type Team = {
  id: number
  name: string
}

export const ODOO_BASE_URL = 'rainforest-uat-ra-290126-28054275.dev.odoo.com'

export const TEAM_NAME_MAP: Record<number, string> = {
  14: 'REFUGIO',
  15: 'POSADA',
  16: 'TRC'
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
  repeat_interval?: number
  repeat_unit?: string
  repeat_type?: string
  recurrence_type?: string | false
  recurrence_value?: number
  archive: boolean
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
  progress?: number
  frequency?: string
  archive: boolean
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

      const frequency = r.recurrence_value !== 0 && r.recurrence_value !== undefined
        ? `${r.recurrence_value} ${r.recurrence_type || ''}`.trim()
        : `${r.repeat_interval || ''} ${r.repeat_unit || ''}`.trim()

      const teamId = team.id ?? r.maintenance_team_id?.[0]
      const teamName = TEAM_NAME_MAP[teamId] || (team.name ?? r.maintenance_team_id?.[1])

      items.push({
        id: r.id,
        name: r.name,
        teamId,
        teamName,
        stageId: r.stage_id?.[0],
        stageName: r.stage_id?.[1],
        priority: Number(r.priority ?? 0),
        scheduleDate: r.schedule_date || undefined,
        equipmentId: r.equipment_id?.[0],
        equipmentName: r.equipment_id?.[1],
        correctiveDate: r.corrective_date || undefined,
        frequency: frequency || undefined,
        archive: r.archive || false
      })
    }
  }
  return items
}
export async function fetchTeams(): Promise<Team[]> {
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/mantenimiento/requests').replace('/requests', '/teams')
  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) return []
  return (data as Team[]).map(t => ({
    ...t,
    name: TEAM_NAME_MAP[t.id] || t.name
  }))
}

/**
 * Converts an Odoo-style date string "YYYY-MM-DD HH:MM:SS" to a Unix epoch (seconds).
 */
export function toEpoch(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const h = Number(m[4])
  const mi = Number(m[5])
  const se = Number(m[6])
  const ms = new Date(y, mo - 1, d, h, mi, se).getTime()
  return Math.floor(ms / 1000)
}
