import { NextResponse } from 'next/server'
import { promisify } from 'util'
import { gunzip } from 'zlib'

const gunzipAsync = promisify(gunzip)

// Module-level cache — survives across requests in the same Node.js process
let cached: { geojson: object; date: string } | null = null

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function daysAgoStr(n: number) {
  const d = new Date(Date.now() - n * 86400000)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

async function fetchKmz(dateStr: string): Promise<Buffer | null> {
  const url = `https://cwcgom.aoml.noaa.gov/SIR/KMZ/sargassum_risk_${dateStr}.kmz`
  const res = await fetch(url)
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

// KMZ is a ZIP file. Use a minimal ZIP parser to extract the KML entry.
function extractKmlFromZip(buf: Buffer): string {
  // ZIP local file header: signature 0x04034b50
  // We scan for each local file header and extract the KML entry
  let offset = 0
  while (offset < buf.length - 4) {
    if (buf.readUInt32LE(offset) !== 0x04034b50) {
      offset++
      continue
    }
    const compression = buf.readUInt16LE(offset + 8)
    const compressedSize = buf.readUInt32LE(offset + 18)
    const fileNameLen = buf.readUInt16LE(offset + 26)
    const extraLen = buf.readUInt16LE(offset + 28)
    const fileName = buf.slice(offset + 30, offset + 30 + fileNameLen).toString('utf8')
    const dataStart = offset + 30 + fileNameLen + extraLen

    if (fileName.endsWith('.kml')) {
      const compressedData = buf.slice(dataStart, dataStart + compressedSize)
      if (compression === 0) {
        // No compression (stored)
        return compressedData.toString('utf8')
      } else if (compression === 8) {
        // Deflate — use zlib with raw inflate (no header)
        const { inflateRawSync } = require('zlib')
        return inflateRawSync(compressedData).toString('utf8')
      }
    }
    offset = dataStart + compressedSize
  }
  throw new Error('No KML file found in ZIP')
}

function kmlToGeoJson(kmlText: string): object {
  const features: object[] = []
  const placemarkRe = /<Placemark[^>]*>([\s\S]*?)<\/Placemark>/g
  let m: RegExpExecArray | null
  while ((m = placemarkRe.exec(kmlText)) !== null) {
    const block = m[1]
    const riskM = block.match(/<SimpleData name="risk">(\d+)<\/SimpleData>/)
    if (!riskM) continue
    const risk = parseInt(riskM[1], 10)
    if (risk === 0) continue

    const coordM = block.match(/<coordinates>([\s\S]*?)<\/coordinates>/)
    if (!coordM) continue

    const coords = coordM[1]
      .trim()
      .split(/\s+/)
      .map(c => {
        const [lng, lat] = c.split(',').map(Number)
        return [lng, lat]
      })
      .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))

    if (coords.length < 2) continue

    features.push({
      type: 'Feature',
      properties: { risk },
      geometry: { type: 'LineString', coordinates: coords },
    })
  }

  return { type: 'FeatureCollection', features }
}

export const maxDuration = 30

export async function GET() {
  const today = todayStr()
  if (cached && cached.date === today) {
    return NextResponse.json(cached.geojson, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  }

  let kmzBuffer: Buffer | null = null
  for (let i = 0; i <= 3; i++) {
    const dateStr = i === 0 ? today : daysAgoStr(i)
    kmzBuffer = await fetchKmz(dateStr)
    if (kmzBuffer) break
  }
  if (!kmzBuffer) {
    return NextResponse.json({ error: 'NOAA data unavailable' }, { status: 503 })
  }

  const kmlText = extractKmlFromZip(kmzBuffer)
  const geojson = kmlToGeoJson(kmlText)
  cached = { geojson, date: today }

  return NextResponse.json(geojson, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
