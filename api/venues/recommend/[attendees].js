const { VENUE_CAPACITIES } = require('../../../server-constants') || {};

function getRecommendedVenues(attendees) {
  const venues = [];
  for (const [venue, capacity] of Object.entries(VENUE_CAPACITIES)) {
    venues.push({ venue, capacity, suitable: capacity >= attendees });
  }
  return venues.sort((a, b) => {
    if (a.suitable && !b.suitable) return -1;
    if (!a.suitable && b.suitable) return 1;
    return a.capacity - b.capacity;
  });
}

module.exports = async (req, res) => {
  try {
    const { attendees } = req.query || req;
    const n = parseInt(req.query.attendees || req.query.attendees || 0);
    if (!n || n <= 0) {
      return res.status(400).json({ error: 'Valid attendee count is required' });
    }
    const venues = getRecommendedVenues(n);
    res.status(200).json({ success: true, attendees: n, venues, count: venues.length });
  } catch (err) {
    console.error('API /api/venues/recommend error', err);
    res.status(500).json({ error: 'Failed to get venue recommendations' });
  }
};
