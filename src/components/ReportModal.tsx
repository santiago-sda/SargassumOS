'use client'
import { useState, useEffect } from 'react'
import type { Beach, Condition } from '@/types'

const CONDITIONS: { value: Condition; label: string; bg: string; text: string }[] = [
  { value: 'clean',    label: 'Clear',    bg: '#dcfce7', text: '#16a34a' },
  { value: 'light',    label: 'Light',    bg: '#fef9c3', text: '#ca8a04' },
  { value: 'moderate', label: 'Moderate', bg: '#ffedd5', text: '#ea580c' },
  { value: 'heavy',    label: 'Heavy',    bg: '#fee2e2', text: '#dc2626' },
]

interface Props {
  beaches: Beach[]
  onClose: () => void
  onSuccess: () => void
}

export default function ReportModal({ beaches, onClose, onSuccess }: Props) {
  const [beachId, setBeachId] = useState('')
  const [condition, setCondition] = useState<Condition | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit() {
    if (!beachId || !condition) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/beaches/${beachId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition, note: note.trim() || null, photo_url: null }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Submission failed')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = !!beachId && !!condition && !submitting

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', width: 380, maxWidth: '90vw', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >×</button>

        <h2 style={{ fontWeight: 700, fontSize: 20, color: '#111', marginBottom: 20 }}>Report Conditions</h2>

        {/* Beach selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Beach</label>
          <select
            value={beachId}
            onChange={e => setBeachId(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
              fontSize: 14, color: beachId ? '#111' : '#9ca3af', background: '#fff',
              outline: 'none', cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
            }}
          >
            <option value="">Select a beach...</option>
            {beaches.sort((a, b) => a.name.localeCompare(b.name)).map(b => (
              <option key={b.id} value={b.id}>{b.name} — {b.country}</option>
            ))}
          </select>
        </div>

        {/* Condition picker */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Current condition</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {CONDITIONS.map(c => (
              <button
                key={c.value}
                onClick={() => setCondition(c.value)}
                style={{
                  padding: '8px 0', borderRadius: 10, border: condition === c.value ? `2px solid ${c.text}` : '2px solid transparent',
                  background: c.bg, color: c.text, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  transition: 'border 0.15s',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Note <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Anything useful for other travelers..."
            rows={3}
            maxLength={280}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
              fontSize: 14, color: '#111', resize: 'none', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
            background: canSubmit ? '#3b82f6' : '#bfdbfe',
            color: '#fff', fontWeight: 700, fontSize: 15, cursor: canSubmit ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
      </div>
    </div>
  )
}
