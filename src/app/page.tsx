'use client'
import { useState, useRef, useEffect } from 'react'
import { useBeaches } from '@/hooks/useBeaches'
import MapView from '@/components/Map/MapView'
import BeachSearch, { type BeachSearchHandle } from '@/components/Map/BeachSearch'
import ConditionFilter from '@/components/Map/ConditionFilter'
import Legend from '@/components/Map/Legend'
import GeolocateButton from '@/components/Map/GeolocateButton'
import DetailPanel from '@/components/DetailPanel/DetailPanel'
import ReportModal from '@/components/ReportModal'
import Spinner from '@/components/ui/Spinner'
import MapTabs, { type MapTab } from '@/components/Map/MapTabs'
import IncomingRiskLegend from '@/components/Map/IncomingRiskLegend'
import type { Beach, Condition } from '@/types'

const FILTER_LABEL: Record<Condition, string> = {
  clean: 'Clean', light: 'Light', moderate: 'Moderate', heavy: 'Heavy', unknown: 'Unknown',
}

export default function HomePage() {
  const { beaches, isLoading, refresh } = useBeaches()
  const [activeTab, setActiveTab] = useState<MapTab>('beach-conditions')
  const [filter, setFilter] = useState<Condition | 'all'>('all')
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null)
  const searchRef = useRef<BeachSearchHandle | null>(null)

  const visibleCount = filter === 'all'
    ? beaches.length
    : beaches.filter(b => b.current_condition === filter).length

  useEffect(() => {
    if (!selectedBeach) return
    const updated = beaches.find(b => b.id === selectedBeach.id)
    if (updated && updated.current_condition !== selectedBeach.current_condition) {
      setSelectedBeach(updated)
    }
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
          filter={filter}
          onSelectBeach={setSelectedBeach}
          flyToRef={flyToRef}
          showMarkers={activeTab === 'beach-conditions'}
          showRiskLayer={activeTab === 'incoming-risk'}
        />
      </div>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-10 flex flex-col gap-2 p-3">
        {/* Title */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow px-4 py-2.5">
          <h1 className="text-base font-bold text-gray-800 leading-tight">🌿 SargassumOS</h1>
          <p className="text-xs text-gray-500">Caribbean beach conditions</p>
        </div>

        {/* Tabs */}
        <MapTabs active={activeTab} onChange={setActiveTab} />

        {/* Search */}
        <BeachSearch
          beaches={beaches}
          onSelect={(beach) => { handleLocate(beach.lat, beach.lng) }}
          wrapperClassName="relative w-full"
        />

        {/* Filter chips — only on Beach Conditions tab */}
        {activeTab === 'beach-conditions' && (
          <div className="overflow-x-auto -mx-3 px-3">
            <ConditionFilter
              active={filter}
              onChange={setFilter}
              className="flex gap-2 w-max"
            />
          </div>
        )}
      </div>

      {/* ── Desktop elements ── */}
      <div className="hidden md:block absolute top-3 left-3 z-10">
        <div className="bg-white/90 backdrop-blur rounded-xl shadow px-4 py-2">
          <h1 className="text-base font-bold text-gray-800 leading-tight">SargassumOS</h1>
          <p className="text-xs text-gray-500">Caribbean beach conditions</p>
        </div>
      </div>

      {/* Desktop tabs — left aligned, below title */}
      <MapTabs
        active={activeTab}
        onChange={setActiveTab}
        className="hidden md:flex absolute top-[68px] left-3 z-10"
      />

      <BeachSearch
        ref={searchRef}
        beaches={beaches}
        onSelect={(beach) => { handleLocate(beach.lat, beach.lng) }}
        wrapperClassName="hidden md:block absolute top-[124px] left-3 z-10 w-72"
      />

      {/* Desktop condition filter — centered, only on Beach Conditions tab */}
      {activeTab === 'beach-conditions' && (
        <ConditionFilter
          active={filter}
          onChange={setFilter}
          className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 z-10 gap-2 flex-wrap justify-center px-3"
        />
      )}

      {activeTab === 'beach-conditions' && <Legend />}
      {activeTab === 'incoming-risk' && <IncomingRiskLegend />}

      {/* Geolocate — hide on mobile when panel is open */}
      <GeolocateButton
        onLocate={handleLocate}
        className={`absolute z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition bottom-8 right-3 ${selectedBeach ? 'hidden md:flex' : 'flex'}`}
      />

      {/* Empty state */}
      {!isLoading && filter !== 'all' && visibleCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow px-6 py-4 text-center">
            <p className="font-semibold text-gray-800">No {FILTER_LABEL[filter as Condition]} beaches found</p>
            <p className="text-sm text-gray-500 mt-1">Try a different filter or check back later</p>
          </div>
        </div>
      )}

      {/* Floating Report button — only on Beach Conditions tab */}
      {!selectedBeach && activeTab === 'beach-conditions' && (
        <>
          {/* Mobile: full-width */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="md:hidden absolute bottom-6 left-4 right-4 z-10 bg-gray-900 text-white font-bold rounded-full shadow-lg cursor-pointer py-4 text-[15px]"
          >
            🌿 Report Conditions
          </button>
          {/* Desktop: centered pill */}
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
