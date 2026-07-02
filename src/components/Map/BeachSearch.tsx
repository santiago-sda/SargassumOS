'use client'
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import type { Beach } from '@/types'

interface Props {
  beaches: Beach[]
  onSelect: (beach: Beach) => void
  wrapperClassName?: string
}

export interface BeachSearchHandle {
  focus: () => void
}

const BeachSearch = forwardRef<BeachSearchHandle, Props>(function BeachSearch({ beaches, onSelect, wrapperClassName }, ref) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
      setOpen(true)
    },
  }))
  const containerRef = useRef<HTMLDivElement>(null)

  const results = query.trim().length < 1 ? [] : beaches.filter(b =>
    b.name.toLowerCase().includes(query.toLowerCase()) ||
    b.country?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  function handleSelect(beach: Beach) {
    setQuery(beach.name)
    setOpen(false)
    onSelect(beach)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className={wrapperClassName ?? 'absolute top-16 left-3 z-10 w-72'}>
      {/* Input */}
      <div style={{
        background: '#fff',
        borderRadius: 999,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search a beach or destination..."
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14,
            color: '#111',
            width: '100%',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1, padding: 0 }}
          >×</button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          marginTop: 6,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          {results.map((beach, i) => (
            <button
              key={beach.id}
              onClick={() => handleSelect(beach)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderTop: i > 0 ? '1px solid #f3f4f6' : 'none',
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{beach.name}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{beach.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default BeachSearch
