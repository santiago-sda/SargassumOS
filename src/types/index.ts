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
  webcam_url: string | null
  webcam_snapshot_url: string | null
  sargassum_coverage: number | null
  detection_patches: number | null
  detection_updated_at: string | null
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
