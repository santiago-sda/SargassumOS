import { createClient } from '@supabase/supabase-js'
import type { Condition } from '@/types'

// Wire Copernicus AFAI data here. Call this function from your ingestion pipeline
// after computing AFAI-derived sargassum coverage for a given beach.
export async function updateSatelliteCondition(
  beachId: string,
  condition: Condition
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('beaches')
    .update({ satellite_condition: condition })
    .eq('id', beachId)

  if (error) throw error
}
