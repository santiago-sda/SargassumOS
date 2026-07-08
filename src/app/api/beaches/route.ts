import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('beaches')
    .select('id, name, lat, lng, country, current_condition, satellite_condition, last_updated, webcam_url, webcam_snapshot_url, sargassum_coverage, detection_patches, detection_updated_at, reports(count)')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Flatten Supabase's nested count: [{ count: N }] → N
  const beaches = (data ?? []).map((b: any) => ({
    ...b,
    report_count: b.reports?.[0]?.count ?? 0,
    reports: undefined,
  }))

  return NextResponse.json(beaches)
}
