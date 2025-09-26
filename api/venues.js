const { connect } = require('../lib/mongo');
const { VENUE_CAPACITIES } = require('../server-constants') || {};

module.exports = async (req, res) => {
  try {
    // No DB needed for static venue capacities
    const venues = Object.entries(VENUE_CAPACITIES || {}).map(([venue, capacity]) => ({ venue, capacity }));
    res.status(200).json({ success: true, venues, count: venues.length });
  } catch (err) {
    console.error('API /api/venues error', err);
    res.status(500).json({ error: 'Failed to get venues' });
  }
};
