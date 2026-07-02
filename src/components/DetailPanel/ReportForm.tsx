'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Condition } from '@/types'

const CONDITIONS: { value: Condition; label: string; color: string }[] = [
  { value: 'clean',    label: 'Clean',    color: 'bg-green-500' },
  { value: 'light',    label: 'Light',    color: 'bg-yellow-400' },
  { value: 'moderate', label: 'Moderate', color: 'bg-orange-400' },
  { value: 'heavy',    label: 'Heavy',    color: 'bg-red-500' },
]

interface Props {
  beachId: string
  beachName: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ReportForm({ beachId, beachName, onSuccess, onCancel }: Props) {
  const [condition, setCondition] = useState<Condition | null>(null)
  const [note, setNote] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function uploadPhoto(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${beachId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('report-photos').upload(path, file, { upsert: false })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('report-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!condition) { setError('Please select a condition.'); return }
    setSubmitting(true)
    setError(null)

    try {
      let photo_url: string | null = null
      if (photoFile) photo_url = await uploadPhoto(photoFile)

      const res = await fetch(`/api/beaches/${beachId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition, note: note.trim() || null, photo_url }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Submission failed')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">Reporting for <span className="font-medium text-gray-700">{beachName}</span></p>
        <p className="text-sm font-semibold text-gray-800">How much sargassum is on the beach?</p>
      </div>

      {/* Condition picker */}
      <div className="grid grid-cols-2 gap-2">
        {CONDITIONS.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCondition(c.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
              condition === c.value
                ? 'border-gray-800 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${c.color}`} />
            {c.label}
          </button>
        ))}
      </div>

      {/* Photo upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
              className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition"
          >
            + Add photo (optional)
          </button>
        )}
      </div>

      {/* Note */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add a note… (optional)"
        rows={2}
        maxLength={280}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !condition}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
