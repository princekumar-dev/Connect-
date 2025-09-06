<<<<<<< HEAD
// Utility to check if a hall is already booked for the same date and time
// Returns booking info if unavailable, otherwise null
async function checkHallAvailability(hall, date, time, duration) {
  function parseTime(timeStr) {
    // Expects HH:mm format
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return null;
    const bookings = await response.json();
    if (!Array.isArray(bookings)) return null;
    const reqStart = parseTime(time);
    const reqEnd = reqStart + parseInt(duration);
    // Find a booking for the same hall, date, and overlapping time that is not cancelled
    return bookings.find(b => {
      if (b.venue !== hall || b.date !== date) return false;
      if (!b.status || b.status.toLowerCase() === 'cancelled') return false;
      // Block if any booking is not cancelled (pending, approved, etc.) and overlaps
      const bStart = parseTime(b.time);
      const bEnd = bStart + parseInt(b.duration);
      return reqStart < bEnd && reqEnd > bStart;
    });
  } catch {
    return null;
  }
}
=======
// Utility to check if a hall is already booked for the same date and time
// Returns booking info if unavailable, otherwise null
async function checkHallAvailability(hall, date, time, duration) {
  function parseTime(timeStr) {
    // Expects HH:mm format
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) return null;
    const bookings = await response.json();
    if (!Array.isArray(bookings)) return null;
    const reqStart = parseTime(time);
    const reqEnd = reqStart + parseInt(duration);
    // Find a booking for the same hall, date, and overlapping time that is not cancelled
    return bookings.find(b => {
      if (b.venue !== hall || b.date !== date) return false;
      if (!b.status || b.status.toLowerCase() === 'cancelled') return false;
      // Block if any booking is not cancelled (pending, approved, etc.) and overlaps
      const bStart = parseTime(b.time);
      const bEnd = bStart + parseInt(b.duration);
      return reqStart < bEnd && reqEnd > bStart;
    });
  } catch {
    return null;
  }
}
>>>>>>> cabfcf0 (Save local changes before rebase)
