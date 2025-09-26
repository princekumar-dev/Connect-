import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif', padding: 24 }}>
      <h1>MSEC Connect (Next.js)</h1>
      <p>This is the initial Next.js scaffold. Existing static pages are still available under the repo root and will be migrated gradually.</p>
      <ul>
        <li><a href="/book.html">Legacy Book Page</a></li>
        <li><a href="/events.html">Legacy Events Page</a></li>
        <li><a href="/bookings.html">Legacy Bookings Page</a></li>
      </ul>
    </main>
  )
}
