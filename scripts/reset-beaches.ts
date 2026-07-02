import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const sb = createClient(url, key)

  const { error: delErr } = await sb.from('beaches').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) { console.error('Delete error:', delErr.message); process.exit(1) }
  console.log('Beaches table cleared')
}

main()
