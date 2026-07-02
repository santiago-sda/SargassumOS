export type Condition = 'clean' | 'light' | 'moderate' | 'heavy' | 'unknown'

export interface Beach {
  id: string
  name: string
  lat: number
  lng: number
  country: string
  satellite_condition: Condition | null
  current_condition: Condition
  last_updated: string | null
  report_count: number
}

export interface Report {
  id: string
  beach_id: string
  condition: Condition
  photo_url: string | null
  note: string | null
  created_at: string
  user_id: string | null
}

export interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}
