import { NextResponse } from 'next/server'

export const maxDuration = 15

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  if (!lat || !lng) return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 })

  try {
    const res = await fetch(`https://wttr.in/${lat},${lng}?format=j1`, {
      headers: { 'User-Agent': 'SargassumOS/1.0' },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Wind data unavailable' }, { status: 503 })
    const data = await res.json()
    const current = data.current_condition?.[0]
    if (!current) return NextResponse.json({ error: 'No data' }, { status: 503 })
    return NextResponse.json({
      speed: parseInt(current.windspeedKmph),
      direction: parseInt(current.winddirDegree),
    })
  } catch (e) {
    return NextResponse.json({ error: 'Wind data unavailable' }, { status: 503 })
  }
}
