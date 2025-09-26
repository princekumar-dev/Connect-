const { connect } = require('../lib/mongo');
const { Booking, User } = require('../models');

module.exports = async (req, res) => {
  try {
    await connect();
    if (req.method === 'GET') {
      // If admin header is present, return all bookings
      const headerEmail = req.headers['useremail'] || req.headers['user-email'] || req.headers['userEmail'];
      if (headerEmail && headerEmail.toLowerCase() === 'admin@msec.edu.in') {
        const bookings = await Booking.find({}).sort({ priority: 1 });
        return res.status(200).json({ success: true, bookings, count: bookings.length });
      }
      // Otherwise require user email header to filter
      const userEmail = headerEmail;
      if (!userEmail) return res.status(401).json({ error: 'User email header required' });
      const bookings = await Booking.find({ email: { $regex: new RegExp(userEmail, 'i') } });
      return res.status(200).json({ success: true, bookings, count: bookings.length });
    }

    if (req.method === 'POST') {
      const { venue, date, time, attendees, organizer, email, purpose, purposeCategory } = req.body;
      if (!venue || !date || !time || !attendees || !organizer || !email || !purpose) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const lastBooking = await Booking.findOne({}, {}, { sort: { id: -1 } });
      const newId = lastBooking ? lastBooking.id + 1 : 1;

      const user = await User.findOne({ email });
      const priorityMap = { secretary: 1, principal: 2, hod: 3, staff: 4 };
      const userPriority = user && priorityMap[user.role] ? priorityMap[user.role] : 99;
      let bookingStatus = 'pending';
      let approvedBy = null;
      let approvalDate = null;
      if (user && (user.role === 'secretary' || user.role === 'principal')) {
        bookingStatus = 'confirmed';
        approvedBy = 'auto-approved';
        approvalDate = new Date().toISOString();
      }

      const newBooking = new Booking({
        id: newId,
        venue,
        date,
        time,
        attendees: parseInt(attendees),
        organizer,
        email,
        purpose,
        purposeCategory: purposeCategory || 'Other',
        status: bookingStatus,
        createdAt: new Date().toISOString(),
        priority: userPriority,
        approvedBy,
        approvalDate
      });
      await newBooking.save();
      return res.status(201).json({ success: true, booking: newBooking });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /api/bookings error', err);
    res.status(500).json({ error: 'Failed to process bookings' });
  }
};
