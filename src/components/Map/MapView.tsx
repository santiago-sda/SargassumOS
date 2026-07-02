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
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);cursor:pointer;`
  return el
}

interface PopupProps {
  beach: Beach
  pos: { x: number; y: number }
  onReport: () => void
  onClose: () => void
}

function BeachPopup({ beach, pos, onReport, onClose }: PopupProps) {
  const color = CONDITION_COLOR[beach.current_condition] ?? CONDITION_COLOR.unknown
  const label = CONDITION_LABEL[beach.current_condition] ?? 'Unknown'
  const ago = timeAgo(beach.last_updated)

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, calc(-100% - 18px))',
        zIndex: 50,
        pointerEvents: 'auto',
        minWidth: 240,
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

        {/* Meta */}
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8, display: 'flex', gap: 10 }}>
          {beach.report_count > 0 && (
            <span>📋 {beach.report_count} report{beach.report_count !== 1 ? 's' : ''}</span>
          )}
          {ago && <span>🕒 {ago}</span>}
          {!beach.last_updated && <span>No reports yet — be the first!</span>}
        </div>

        {/* Report button */}
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
          {beach.report_count > 0 ? 'Open Details' : 'Report this beach'}
        </button>
      </div>
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

  // Project lngLat to screen coords
  const projectPopup = useCallback((beach: Beach) => {
    const map = mapRef.current
    if (!map) return
    const p = map.project([beach.lng, beach.lat])
    setPopupPos({ x: p.x, y: p.y })
  }, [])

  // Update popup position on map move
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

      map.on('error', (e: any) => console.error('[MapView] error:', e))
      map.on('load', () => map.resize())
      // Close popup on map click
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
                1, '#facc15',   // warning → yellow
                2, '#f97316',   // medium  → orange
                3, '#dc2626',   // high    → red
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

    if (map.isStyleLoaded()) {
      addLayer()
    } else {
      map.once('load', addLayer)
    }

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
      {popupBeach && popupPos && (
        <BeachPopup
          beach={popupBeach}
          pos={popupPos}
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
