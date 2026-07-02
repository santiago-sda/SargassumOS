'use client'

interface Props {
  onLocate: (lat: number, lng: number) => void
  className?: string
}

export default function GeolocateButton({ onLocate, className }: Props) {
  function handle() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocate(pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn('Geolocation error', err)
    )
  }

  return (
    <button
      onClick={handle}
      title="Near me"
      className={className ?? 'absolute bottom-8 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    </button>
  )
}
