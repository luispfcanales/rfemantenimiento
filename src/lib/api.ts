export type Team = {
  id: number
  name: string
}

export const ODOO_BASE_URL = 'rainforest-uat-ra-090226-28435160.dev.odoo.com'
export const ODOO_BASE_URL_PROD = 'rainforest.odoo.com'

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
  request_date?: string
  preventive_date?: string
  repeat_interval?: number
  repeat_unit?: string
  repeat_type?: string
  recurrence_type?: string | false
  recurrence_value?: number
  used_value?: number
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
  requestDate?: string
  preventiveDate?: string
  progress?: number
  frequency?: string
  frequencyUnit?: string
  recurrenceValue?: number
  usedValue?: number
  archive: boolean
}

export async function fetchRequests(isProduction: boolean = false): Promise<RequestItem[]> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/mantenimiento/requests'
  const apiUrl = isProduction ? `${baseUrl}?base=prod` : baseUrl
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

      const getFrequencyLabel = (val: number | undefined, unit: string | undefined) => {
        if (!val || !unit) return ''
        const u = unit.toLowerCase()
        const isPlural = val > 1
        const map: Record<string, { singular: string; plural: string }> = {
          day: { singular: 'día', plural: 'dias' },
          days: { singular: 'día', plural: 'dias' },
          week: { singular: 'semana', plural: 'semanas' },
          weeks: { singular: 'semana', plural: 'semanas' },
          month: { singular: 'mes', plural: 'meses' },
          months: { singular: 'mes', plural: 'meses' },
          year: { singular: 'año', plural: 'años' },
          years: { singular: 'año', plural: 'años' },
          hour: { singular: 'hora', plural: 'horas' },
          hours: { singular: 'hora', plural: 'horas' }
        }
        const label = map[u] ? (isPlural ? map[u].plural : map[u].singular) : u
        return `${val} ${label}`
      }

      const frequency = r.recurrence_value !== 0 && r.recurrence_value !== undefined
        ? getFrequencyLabel(r.recurrence_value, r.recurrence_type || '')
        : getFrequencyLabel(r.repeat_interval, r.repeat_unit || '')

      const teamId = team.id ?? r.maintenance_team_id?.[0]
      const teamName = TEAM_NAME_MAP[teamId] || (team.name ?? r.maintenance_team_id?.[1])

      const frequencyUnit = (r.recurrence_value !== 0 && r.recurrence_value !== undefined ? r.recurrence_type : r.repeat_unit) || undefined
      const recurrenceValue = r.recurrence_value !== 0 && r.recurrence_value !== undefined ? r.recurrence_value : r.repeat_interval

      let progress = 0
      const unit = frequencyUnit?.toLowerCase()
      const isHours = unit === 'hours' || unit === 'hour' || unit === 'horas' || unit === 'hora'

      if (isHours && r.used_value !== undefined && recurrenceValue) {
        progress = Math.min(100, Math.round((r.used_value / recurrenceValue) * 100))
      } else {
        const now = Math.floor(Date.now() / 1000)
        // Start date: request_date preferred, then corrective_date
        const startDateEpoch = r.request_date ? toEpoch(r.request_date) : (r.corrective_date ? toEpoch(r.corrective_date) : null)

        // Target date: preventive_date (new requirement) preferred, then schedule_date, then corrective_date
        let targetDateEpoch = r.preventive_date ? toEpoch(r.preventive_date) : null
        if (targetDateEpoch === null) {
          const legacyDate = r.schedule_date || r.corrective_date
          if (legacyDate) targetDateEpoch = toEpoch(legacyDate)
        }

        if (startDateEpoch !== null && targetDateEpoch !== null) {
          if (targetDateEpoch > startDateEpoch) {
            const elapsed = Math.max(0, now - startDateEpoch)
            const totalDuration = targetDateEpoch - startDateEpoch
            progress = Math.min(100, Math.round((elapsed / totalDuration) * 100))
          } else if (now >= targetDateEpoch) {
            progress = 100
          }
        }
      }

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
        requestDate: r.request_date || undefined,
        preventiveDate: r.preventive_date || undefined,
        progress: progress,
        frequency: frequency || undefined,
        frequencyUnit: frequencyUnit,
        recurrenceValue: recurrenceValue,
        usedValue: r.used_value,
        archive: r.archive || false
      })
    }
  }
  return items
}
export async function fetchTeams(isProduction: boolean = false): Promise<Team[]> {
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/mantenimiento/requests').replace('/requests', '/teams')
  const apiUrl = isProduction ? `${baseUrl}?base=prod` : baseUrl
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
  const fullMatch = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  if (fullMatch) {
    const y = Number(fullMatch[1]), mo = Number(fullMatch[2]), d = Number(fullMatch[3])
    const h = Number(fullMatch[4]), mi = Number(fullMatch[5]), se = Number(fullMatch[6])
    return Math.floor(Date.UTC(y, mo - 1, d, h, mi, se) / 1000)
  }
  const dateMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateMatch) {
    const y = Number(dateMatch[1]), mo = Number(dateMatch[2]), d = Number(dateMatch[3])
    return Math.floor(Date.UTC(y, mo - 1, d, 0, 0, 0) / 1000)
  }
  return null
}
