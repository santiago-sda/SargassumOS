import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('beach_id', id)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { condition, note, photo_url } = body

  if (!condition) return NextResponse.json({ error: 'condition is required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { data, error } = await supabase
    .from('reports')
    .insert({ beach_id: id, condition, note: note || null, photo_url: photo_url || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Recompute beach condition using service role (bypasses RLS)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createServiceClient() as any
  const { data: condData } = await admin.rpc('derive_condition', { p_beach_id: id })
  if (condData) {
    await admin
      .from('beaches')
      .update({ current_condition: condData, last_updated: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json(data, { status: 201 })
}
