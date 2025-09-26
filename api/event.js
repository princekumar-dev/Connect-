const { connect } = require('../lib/mongo');
const { Event } = require('../models');

module.exports = async (req, res) => {
  try {
    await connect();
    if (req.method === 'GET') {
      const events = await Event.find({});
      return res.status(200).json({ success: true, events, count: events.length });
    }

    if (req.method === 'POST') {
      const { name, date, time, desc, image } = req.body;
      if (!name || !date || !time || !desc || !image) {
        return res.status(400).json({ error: 'All fields are required; image must be a URL (not base64)' });
      }

      // Reject base64 images to keep serverless payloads small
      if (typeof image === 'string' && image.startsWith('data:')) {
        return res.status(413).json({ error: 'Please upload images to a storage provider and send the image URL instead of base64' });
      }

      const lastEvent = await Event.findOne({}, {}, { sort: { id: -1 } });
      const newId = lastEvent ? lastEvent.id + 1 : 1;
      const newEvent = new Event({ id: newId, name, date, time, desc, image, createdAt: new Date().toISOString() });
      await newEvent.save();
      res.status(201).json({ success: true, event: newEvent });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('API /api/event error', err);
    res.status(500).json({ error: 'Failed to process event' });
  }
};
