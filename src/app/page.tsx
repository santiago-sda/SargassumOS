'use client'
import { useState, useRef, useEffect } from 'react'
import { useBeaches } from '@/hooks/useBeaches'
import MapView from '@/components/Map/MapView'
import BeachSearch, { type BeachSearchHandle } from '@/components/Map/BeachSearch'
import Legend from '@/components/Map/Legend'
import GeolocateButton from '@/components/Map/GeolocateButton'
import DetailPanel from '@/components/DetailPanel/DetailPanel'
import ReportModal from '@/components/ReportModal'
import Spinner from '@/components/ui/Spinner'
import MapTabs, { type MapTab } from '@/components/Map/MapTabs'
import IncomingRiskLegend from '@/components/Map/IncomingRiskLegend'
import type { Beach } from '@/types'

export default function HomePage() {
  const { beaches, isLoading, refresh } = useBeaches()
  const [activeTab, setActiveTab] = useState<MapTab>('beach-conditions')
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null)
  const searchRef = useRef<BeachSearchHandle | null>(null)

  useEffect(() => {
    if (!selectedBeach) return
    const updated = beaches.find(b => b.id === selectedBeach.id)
    if (updated) setSelectedBeach(updated)
  }, [beaches])

  function handleLocate(lat: number, lng: number) {
    flyToRef.current?.(lat, lng)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-white/60">
          <Spinner />
        </div>
      )}

      <div ref={mapContainerRef} className="absolute inset-0">
        <MapView
          beaches={beaches}
          filter="all"
          onSelectBeach={setSelectedBeach}
          flyToRef={flyToRef}
          showMarkers={activeTab === 'beach-conditions'}
          showRiskLayer={activeTab === 'incoming-risk'}
        />
      </div>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-10 flex flex-col gap-1.5 p-3">
        {/* Title */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow px-3 py-2 self-start">
          <h1 className="text-sm font-bold text-gray-800 leading-tight">🌿 SargassumOS</h1>
          <p className="text-xs text-gray-500">By: Santiago Stebelski</p>
        </div>

        {/* Tabs + Search — same width */}
        <div className="self-start flex flex-col gap-1.5 w-full max-w-fit">
          <MapTabs active={activeTab} onChange={setActiveTab} />
          <BeachSearch
            beaches={beaches}
            onSelect={(beach) => { handleLocate(beach.lat, beach.lng) }}
            wrapperClassName="relative w-full"
          />
        </div>
      </div>

      {/* ── Desktop elements ── */}
      <div className="hidden md:flex flex-col gap-2 absolute top-3 left-3 z-10">
        {/* Title */}
        <div className="bg-white/90 backdrop-blur rounded-xl shadow px-4 py-2 w-fit">
          <h1 className="text-base font-bold text-gray-800 leading-tight">SargassumOS</h1>
          <p className="text-xs text-gray-500">By: Santiago Stebelski</p>
        </div>
        {/* Tabs + search share the same width */}
        <div className="flex flex-col gap-2 w-max">
          <MapTabs active={activeTab} onChange={setActiveTab} />
          <BeachSearch
            ref={searchRef}
            beaches={beaches}
            onSelect={(beach) => { handleLocate(beach.lat, beach.lng) }}
            wrapperClassName="relative w-full"
          />
        </div>
      </div>

      {activeTab === 'beach-conditions' && <Legend />}
      {activeTab === 'incoming-risk' && <IncomingRiskLegend />}

      {/* Geolocate */}
      <GeolocateButton
        onLocate={handleLocate}
        className={`absolute z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition bottom-28 right-3 ${selectedBeach ? 'hidden md:flex' : 'flex'}`}
      />

      {/* Floating Report button */}
      {!selectedBeach && activeTab === 'beach-conditions' && (
        <>
          <button
            onClick={() => setReportModalOpen(true)}
            className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white font-bold rounded-full shadow-lg cursor-pointer py-3 px-6 text-sm whitespace-nowrap"
          >
            🌿 Report Conditions
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: '#111827', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}
            className="hidden md:block"
          >
            🌿 Report Conditions
          </button>
        </>
      )}

      {reportModalOpen && (
        <ReportModal
          beaches={beaches}
          onClose={() => setReportModalOpen(false)}
          onSuccess={refresh}
        />
      )}

      <DetailPanel
        beach={selectedBeach}
        onClose={() => setSelectedBeach(null)}
        onReport={refresh}
      />
    </div>
  )
}
