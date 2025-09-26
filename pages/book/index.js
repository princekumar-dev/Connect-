import { useEffect, useState } from 'react'

export default function BookPage() {
  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({
    venue: '', date: '', time: '', attendees: 1, organizer: '', email: '', purpose: '', purposeCategory: 'Other'
  })
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetch('/api/venues')
      .then(r => r.json())
      .then(data => {
        if (data && data.venues) {
          setVenues(data.venues)
          if (data.venues.length && !form.venue) {
            setForm(f => ({ ...f, venue: data.venues[0].venue }))
          }
        }
      }).catch(()=>{})
  }, [])

  useEffect(() => {
    // live summary
    setSummary({ ...form })
    // get recommendations when attendees changes
    if (form.attendees && Number(form.attendees) > 0) {
      fetch(`/api/venues/recommend/${form.attendees}`)
        .then(r => r.json())
        .then(d => { if (d && d.venues) setRecommendations(d.venues) })
        .catch(()=>{})
    }
  }, [form])

  function updateField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Booking created' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error' })
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Book a Venue</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
        <div>
          <label>Venue</label>
          <select value={form.venue} onChange={(e)=>updateField('venue', e.target.value)}>
            {venues.map(v => <option key={v.venue} value={v.venue}>{v.venue} (cap: {v.capacity})</option>)}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e)=>updateField('date', e.target.value)} />
        </div>
        <div>
          <label>Time</label>
          <input type="time" value={form.time} onChange={(e)=>updateField('time', e.target.value)} />
        </div>
        <div>
          <label>Attendees</label>
          <input type="number" min={1} value={form.attendees} onChange={(e)=>updateField('attendees', e.target.value)} />
        </div>
        <div>
          <label>Organizer</label>
          <input value={form.organizer} onChange={(e)=>updateField('organizer', e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e)=>updateField('email', e.target.value)} />
        </div>
        <div>
          <label>Purpose</label>
          <input value={form.purpose} onChange={(e)=>updateField('purpose', e.target.value)} />
        </div>
        <div>
          <label>Purpose Category</label>
          <select value={form.purposeCategory} onChange={(e)=>updateField('purposeCategory', e.target.value)}>
            <option>Alumni Talk</option>
            <option>Workshop</option>
            <option>Seminar</option>
            <option>Events</option>
            <option>Other</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Submit Booking</button>
        </div>
      </form>

      <section style={{ marginTop: 24 }}>
        <h2>Live Summary</h2>
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recommended Venues</h2>
        <ul>
          {recommendations.map(r => (
            <li key={r.venue}>{r.venue} — capacity {r.capacity} {r.suitable ? '(suitable)' : ''}</li>
          ))}
        </ul>
      </section>

      {message && <div style={{ marginTop: 12, color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</div>}
    </div>
  )
}
