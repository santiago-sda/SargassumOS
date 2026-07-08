'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import type { Beach, Condition } from '@/types'

export const CONDITION_COLOR: Record<Condition, string> = {
  clean:    '#22c55e',
  light:    '#facc15',
  moderate: '#f97316',
  heavy:    '#dc2626',
  unknown:  '#9ca3af',
}

const CONDITION_LABEL: Record<Condition, string> = {
  clean: 'Clear', light: 'Light', moderate: 'Moderate', heavy: 'Heavy', unknown: 'Unknown',
}

function timeAgo(date: string | null) {
  if (!date) return null
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function makeEl(color: string) {
  const el = document.createElement('div')
  el.style.cssText = `width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);cursor:pointer;`
  return el
}

// Returns the compass bearing (degrees) that sargassum approaches FROM for a given beach.
// 0=N, 90=E, 180=S, 270=W
function getOceanBearing(beach: Beach): number {
  const { lat, lng, name } = beach
  // Florida east coast (Atlantic-facing) → sargassum from east
  if (lng > -81 && lat > 24) return 90
  // Yucatan / Mexico Caribbean coast → northeast
  if (lng > -88 && lng < -85 && lat < 22) return 45
  // Cuba north coast → north
  if (name.toLowerCase().includes('havana') || (lat > 22 && lng > -84 && lng < -74)) return 0
  // Lesser Antilles (Martinique, Guadeloupe, Barbados, etc.) → east/northeast
  if (lng > -63) return 70
  // Dominican Republic / Puerto Rico → north/northeast
  if (lng > -72 && lat > 17) return 30
  // Jamaica → south (Atlantic sargassum wraps south)
  if (lat < 19 && lng > -78 && lng < -76) return 180
  // Default: sargassum primarily arrives from the east
  return 90
}

// Wind direction (met) = where wind comes FROM.
// Returns degrees 0-360 of where wind is GOING (for arrow display).
function windGoingDeg(windFromDeg: number): number {
  return (windFromDeg + 180) % 360
}

function directionArrow(windFromDeg: number): string {
  const going = windGoingDeg(windFromDeg)
  if (going >= 337.5 || going < 22.5) return '↑'
  if (going < 67.5) return '↗'
  if (going < 112.5) return '→'
  if (going < 157.5) return '↘'
  if (going < 202.5) return '↓'
  if (going < 247.5) return '↙'
  if (going < 292.5) return '←'
  return '↖'
}

// Angle difference between two bearings (0–180)
function angleDiff(a: number, b: number): number {
  return Math.abs(((a - b + 180 + 360) % 360) - 180)
}

function windMessage(windFromDeg: number, oceanBearing: number): { text: string; color: string } {
  const diff = angleDiff(windFromDeg, oceanBearing)
  // Wind FROM ocean bearing = blowing toward beach
  if (diff < 60) return { text: 'Wind is pushing sargassum toward this beach', color: '#dc2626' }
  if (diff > 120) return { text: 'Wind is pushing sargassum away from this beach', color: '#16a34a' }
  return { text: 'Wind is blowing parallel to the shore', color: '#d97706' }
}

interface WindData { speed: number; direction: number }

interface PopupProps {
  beach: Beach
  pos: { x: number; y: number }
  wind: WindData | null
  windLoading: boolean
  onReport: () => void
  onClose: () => void
}

function BeachPopup({ beach, pos, wind, windLoading, onReport, onClose }: PopupProps) {
  const color = CONDITION_COLOR[beach.current_condition] ?? CONDITION_COLOR.unknown
  const label = CONDITION_LABEL[beach.current_condition] ?? 'Unknown'
  const ago = timeAgo(beach.last_updated)
  const oceanBearing = getOceanBearing(beach)
  const msg = wind ? windMessage(wind.direction, oceanBearing) : null

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, calc(-100% - 18px))',
        zIndex: 50,
        pointerEvents: 'auto',
        minWidth: 250,
      }}
    >
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '16px 16px 14px', position: 'relative' }}>
        {/* Arrow */}
        <div style={{ position: 'absolute', bottom: -9, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '9px solid #fff' }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', lineHeight: 1 }}
        >×</button>

        {/* Beach name */}
        <div style={{ fontWeight: 700, fontSize: 17, color: '#111', paddingRight: 20 }}>{beach.name}</div>

        {/* Condition */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 14, color }}>{label}</span>
        </div>

        {/* Satellite attribution */}
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
          Sargassum risk based on NOAA AOML satellite data
        </div>
        {beach.last_updated && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            Satellite data from {new Date(beach.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {/* Meta */}
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', gap: 10 }}>
          {beach.report_count > 0 && (
            <span>📋 {beach.report_count} report{beach.report_count !== 1 ? 's' : ''}</span>
          )}
          {ago && <span>🕒 {ago}</span>}
          {!beach.last_updated && <span>No reports yet — be the first!</span>}
        </div>

        {/* Wind */}
        <div style={{ marginTop: 10, padding: '8px 10px', background: '#f9fafb', borderRadius: 8 }}>
          {windLoading && (
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Loading wind data…</div>
          )}
          {!windLoading && wind && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#374151' }}>
                <span style={{ fontSize: 18 }}>{directionArrow(wind.direction)}</span>
                <span>{wind.speed} km/h</span>
              </div>
              {msg && (
                <div style={{ fontSize: 12, color: msg.color, fontWeight: 500, marginTop: 4 }}>
                  {msg.text}
                </div>
              )}
            </>
          )}
          {!windLoading && !wind && (
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Wind data unavailable</div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={onReport}
          style={{
            marginTop: 12,
            width: '100%',
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 0',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
          onMouseLeave={e => (e.currentTarget.style.background = '#111827')}
        >
          {beach.webcam_snapshot_url || beach.report_count > 0 ? 'Open Details' : 'Report this beach'}
        </button>
      </div>
    </div>
  )
}

function ZoomControls({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
  function zoom(delta: number) {
    mapRef.current?.easeTo({ zoom: (mapRef.current.getZoom() ?? 5) + delta, duration: 200 })
  }
  const btn: React.CSSProperties = {
    width: 36, height: 36, background: '#fff', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, color: '#374151', lineHeight: 1,
  }
  return (
    <div style={{
      position: 'absolute', bottom: 32, right: 12, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      borderRadius: 8, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <button style={btn} onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')} onMouseLeave={e => (e.currentTarget.style.background = '#fff')} onClick={() => zoom(1)}>+</button>
      <div style={{ height: 1, background: '#e5e7eb' }} />
      <button style={btn} onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')} onMouseLeave={e => (e.currentTarget.style.background = '#fff')} onClick={() => zoom(-1)}>−</button>
    </div>
  )
}

interface Props {
  beaches: Beach[]
  filter: Condition | 'all'
  onSelectBeach: (beach: Beach) => void
  flyToRef?: React.MutableRefObject<((lat: number, lng: number) => void) | null>
  showMarkers?: boolean
  showRiskLayer?: boolean
}

export default function MapView({ beaches, filter, onSelectBeach, flyToRef, showMarkers = true, showRiskLayer = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const libRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [popupBeach, setPopupBeach] = useState<Beach | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null)
  const [wind, setWind] = useState<WindData | null>(null)
  const [windLoading, setWindLoading] = useState(false)

  // Fetch wind when popup beach changes, then refresh every 15 minutes
  useEffect(() => {
    if (!popupBeach) { setWind(null); return }
    let cancelled = false

    async function fetchWind() {
      try {
        const { lat, lng } = popupBeach!
        const res = await fetch(`/api/wind?lat=${lat}&lng=${lng}`)
        const data = res.ok ? await res.json() : null
        if (!cancelled) { setWind(data?.speed != null ? data : null); setWindLoading(false) }
      } catch (err) {
        console.warn('[Wind] fetch failed:', err)
        if (!cancelled) setWindLoading(false)
      }
    }

    setWind(null)
    setWindLoading(true)
    fetchWind()

    const interval = setInterval(fetchWind, 15 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [popupBeach?.id])

  const projectPopup = useCallback((beach: Beach) => {
    const map = mapRef.current
    if (!map) return
    const p = map.project([beach.lng, beach.lat])
    setPopupPos({ x: p.x, y: p.y })
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !popupBeach) return
    const update = () => projectPopup(popupBeach)
    map.on('move', update)
    return () => map.off('move', update)
  }, [popupBeach, projectPopup])

  // Init map
  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    ;(async () => {
      const mod = await import('mapbox-gl')
      if (destroyed || !containerRef.current) return

      const mapboxgl = mod.default ?? mod
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
      libRef.current = mapboxgl

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-68, 17],
        zoom: 5,
        minZoom: 3,
        pitchWithRotate: false,
      })
      map.touchZoomRotate.disableRotation()
      map.scrollZoom.setWheelZoomRate(1 / 600)
      map.scrollZoom.setZoomRate(1 / 100)

      map.on('error', (e: any) => console.error('[MapView] error:', e))
      map.on('load', () => map.resize())
      map.on('click', () => setPopupBeach(null))
      mapRef.current = map
    })()

    return () => {
      destroyed = true
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
      libRef.current = null
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [])

  // Render markers
  useEffect(() => {
    const map = mapRef.current
    const mapboxgl = libRef.current
    if (!map || !mapboxgl) return

    if (!showMarkers || !beaches.length) {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      return
    }

    const visible = filter === 'all' ? beaches : beaches.filter(b => b.current_condition === filter)

    function render() {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      visible.forEach(beach => {
        const color = CONDITION_COLOR[beach.current_condition] ?? CONDITION_COLOR.unknown
        const el = makeEl(color)
        const ago = beach.last_updated
          ? (() => {
              const s = Math.floor((Date.now() - new Date(beach.last_updated!).getTime()) / 1000)
              if (s < 3600) return `${Math.floor(s / 60)}m ago`
              if (s < 86400) return `${Math.floor(s / 3600)}h ago`
              return `${Math.floor(s / 86400)}d ago`
            })()
          : 'no reports yet'
        el.title = `${beach.name} — ${ago}`
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setPopupBeach(beach)
          projectPopup(beach)
        })
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([beach.lng, beach.lat])
          .addTo(map)
        markersRef.current.push(marker)
      })
    }

    if (map.isStyleLoaded()) { render() } else { map.once('load', render) }
  }, [beaches, filter, projectPopup, showMarkers])

  // Sargassum risk layer
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const SOURCE = 'sargassum-risk'
    const LAYER = 'sargassum-risk-line'

    function removeLayer() {
      if (map.getLayer(LAYER)) map.removeLayer(LAYER)
      if (map.getSource(SOURCE)) map.removeSource(SOURCE)
    }

    if (!showRiskLayer) {
      if (map.isStyleLoaded()) removeLayer()
      return
    }

    async function addLayer() {
      removeLayer()
      try {
        const res = await fetch('/api/sargassum-risk')
        if (!res.ok) return
        const geojson = await res.json()
        if (!map.getSource(SOURCE)) {
          map.addSource(SOURCE, { type: 'geojson', data: geojson })
        }
        if (!map.getLayer(LAYER)) {
          map.addLayer({
            id: LAYER,
            type: 'line',
            source: SOURCE,
            paint: {
              'line-width': 3,
              'line-color': [
                'match', ['get', 'risk'],
                1, '#facc15',
                2, '#f97316',
                3, '#dc2626',
                '#9ca3af',
              ],
              'line-opacity': 0.9,
            },
          })
        }
      } catch (e) {
        console.error('[MapView] risk layer error:', e)
      }
    }

    if (map.isStyleLoaded()) { addLayer() } else { map.once('load', addLayer) }

    return () => {
      if (mapRef.current?.isStyleLoaded()) removeLayer()
    }
  }, [showRiskLayer])

  const flyTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 12, speed: 1.2, curve: 1.4, essential: true })
  }, [])

  useEffect(() => {
    if (flyToRef) flyToRef.current = flyTo
  }, [flyTo, flyToRef])

  return (
    <>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      <ZoomControls mapRef={mapRef} />
      {popupBeach && popupPos && (
        <BeachPopup
          beach={popupBeach}
          pos={popupPos}
          wind={wind}
          windLoading={windLoading}
          onClose={() => setPopupBeach(null)}
          onReport={() => {
            onSelectBeach(popupBeach)
            setPopupBeach(null)
          }}
        />
      )}
    </>
  )
}
