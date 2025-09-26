const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { User, Event, Booking } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
// Increase JSON body size to allow large DataURL image uploads from the client (events upload sends base64 image)
// Set higher limit to accommodate common image sizes when sent as base64 in JSON (temporary for dev)
app.use(express.json({ limit: '50mb' }));

// Venue capacity mapping (restricted to allowed halls for booking form)
const VENUE_CAPACITIES = {
    'KRS Seminar Hall': 50,
    'Civil Seminar Hall': 75,
    'ECE Seminar Hall': 100,
    'MS Auditorium': 500
};

// Get recommended venues based on attendee count
function getRecommendedVenues(attendees) {
    const venues = [];
    for (const [venue, capacity] of Object.entries(VENUE_CAPACITIES)) {
        if (capacity >= attendees) {
            venues.push({ venue, capacity, suitable: true });
        } else {
            venues.push({ venue, capacity, suitable: false });
        }
    }
    // Sort by capacity (suitable venues first, then by capacity ascending)
    return venues.sort((a, b) => {
        if (a.suitable && !b.suitable) return -1;
        if (!a.suitable && b.suitable) return 1;
        return a.capacity - b.capacity;
    });
}

// API routes should come before static file serving
// (Static middleware will be added after API routes)

// Initialize default users if collection is empty
async function initializeUsers() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const initialUsers = [
                { id: 1, email: 'admin@msec.edu.in', password: 'admin@123', name: 'Administrator', role: 'admin' },
                { id: 2, email: 'staff@msec.edu.in', password: 'staff@123', name: 'Staff', role: 'staff' },
                { id: 3, email: 'hod@msec.edu.in', password: 'hod@123', name: 'HOD', role: 'hod' },
                { id: 4, email: 'principal@msec.edu.in', password: 'principal@123', name: 'Principal', role: 'principal' },
                { id: 5, email: 'secretary@msec.edu.in', password: 'secretary@123', name: 'Secretary', role: 'secretary' }
            ];
            await User.insertMany(initialUsers);
            console.log('Default users initialized');
        }
    } catch (error) {
        console.error('Error initializing users:', error);
    }
}

// Call initialization
initializeUsers();

// Helper functions for MongoDB operations
async function getAllBookings() {
    try {
        return await Booking.find({});
    } catch (error) {
        console.error('Error reading bookings:', error);
        return [];
    }
}

async function getAllEvents() {
    try {
        return await Event.find({});
    } catch (error) {
        console.error('Error reading events:', error);
        return [];
    }
}

async function getAllUsers() {
    try {
        return await User.find({});
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

// Middleware to verify admin access
async function verifyAdmin(req, res, next) {
    try {
        // Read header in a tolerant way (headers are lowercased in Node)
        const headerEmail = req.get('userEmail') || req.get('user-email') || req.get('useremail') || req.headers['useremail'] || req.headers['user-email'];
        const actualUserEmail = headerEmail ? String(headerEmail).trim() : null;

        console.log('verifyAdmin: header user email:', actualUserEmail);

        if (!actualUserEmail) {
            console.log('Admin verification failed: No user email provided');
            console.log('Available headers:', Object.keys(req.headers));
            return res.status(401).json({ error: 'User email is required' });
        }

        // Explicit check for admin email
        if (actualUserEmail.toLowerCase() !== 'admin@msec.edu.in') {
            console.log('Admin verification failed: User is not admin:', actualUserEmail);
            return res.status(403).json({ error: 'Admin access required. Only admin@msec.edu.in is authorized.' });
        }

        const user = await User.findOne({ email: actualUserEmail, role: 'admin' });

        if (!user) {
            console.log('Admin verification failed: User not found in database or role mismatch:', actualUserEmail);
            return res.status(403).json({ error: 'Admin access required. User not found or insufficient privileges.' });
        }

        console.log('Admin verification successful for:', actualUserEmail);
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in admin verification:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MSEC Connect Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get recommended venues based on attendee count
app.get('/api/venues/recommend/:attendees', (req, res) => {
    try {
        const attendees = parseInt(req.params.attendees);
        if (!attendees || attendees <= 0) {
            return res.status(400).json({ error: 'Valid attendee count is required' });
        }
        
        const recommendedVenues = getRecommendedVenues(attendees);
        res.json({ 
            success: true, 
            attendees: attendees,
            venues: recommendedVenues,
            count: recommendedVenues.length
        });
    } catch (error) {
        console.error('Error getting recommended venues:', error);
        res.status(500).json({ error: 'Failed to get venue recommendations' });
    }
});

// Get all venues with capacities
app.get('/api/venues', (req, res) => {
    try {
        const venues = Object.entries(VENUE_CAPACITIES).map(([venue, capacity]) => ({
            venue,
            capacity
        }));
        res.json({ 
            success: true, 
            venues: venues,
            count: venues.length
        });
    } catch (error) {
        console.error('Error getting venues:', error);
        res.status(500).json({ error: 'Failed to get venues' });
    }
});

// Get all events
// Remove event (admin only)
app.delete('/api/event/:id', verifyAdmin, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        if (!eventId) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        
        const deletedEvent = await Event.findOneAndDelete({ id: eventId });
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ success: true, message: 'Event removed successfully' });
    } catch (error) {
        console.error('Error removing event:', error);
        res.status(500).json({ error: 'Failed to remove event' });
    }
});

// Get all events
app.get('/api/event', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json({ success: true, events: events, count: events.length });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create new event (admin only)
app.post('/api/event', verifyAdmin, async (req, res) => {
    try {
        const { name, date, time, desc, image } = req.body;
        if (!name || !date || !time || !desc || !image) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // If image is a data URL (base64), check its size before attempting to save
        // Data URLs look like: data:image/png;base64,AAAA...
        if (typeof image === 'string' && image.startsWith('data:')) {
            try {
                const base64Part = image.split(',')[1] || '';
                // Length in bytes ~ (base64 length * 3/4)
                const approxBytes = Math.ceil((base64Part.length * 3) / 4);
                const MAX_BYTES = 15 * 1024 * 1024; // 15MB
                if (approxBytes > MAX_BYTES) {
                    console.warn('Uploaded event image too large:', `${approxBytes} bytes`);
                    return res.status(413).json({ error: 'Uploaded image is too large. Please use a smaller image (max 15MB).' });
                }
            } catch (err) {
                console.warn('Could not parse image data for size check', err);
            }
        }
        
        // Get the highest id and increment
        const lastEvent = await Event.findOne({}, {}, { sort: { 'id': -1 } });
        const newId = lastEvent ? lastEvent.id + 1 : 1;
        
        const newEvent = new Event({
            id: newId,
            name,
            date,
            time,
            desc,
            image,
            createdAt: new Date().toISOString()
        });
        
        const savedEvent = await newEvent.save();
        res.status(201).json({ success: true, event: savedEvent, message: 'Event uploaded successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to upload event' });
    }
});

// Authentication endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email, password });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json({ 
            success: true, 
            user: userWithoutPassword,
            message: `Welcome ${user.name}!`
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all bookings (admin only)
app.get('/api/bookings', verifyAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ priority: 1 });
        res.json({ 
            success: true, 
            bookings: bookings,
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get bookings by status (admin only)
app.get('/api/bookings/status/:status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.params;
        const filteredBookings = await Booking.find({ status: status });
        
        res.json({ 
            success: true, 
            bookings: filteredBookings,
            count: filteredBookings.length,
            status: status
        });
    } catch (error) {
        console.error('Error fetching bookings by status:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get user's own bookings (for regular users)
app.get('/api/user/bookings', async (req, res) => {
    try {
        const userEmail = req.headers.useremail || req.headers.userEmail || req.headers['user-email'];
        
        if (!userEmail) {
            return res.status(401).json({ error: 'User email required' });
        }
        
        const userBookings = await Booking.find({ 
            email: { $regex: new RegExp(userEmail, 'i') }
        });
        
        res.json({ 
            success: true, 
            bookings: userBookings,
            count: userBookings.length,
            userEmail: userEmail
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { venue, date, time, attendees, organizer, email, purpose, purposeCategory } = req.body;
        // Validate required fields
        if (!venue || !date || !time || !attendees || !organizer || !email || !purpose) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate purpose category
        const validCategories = ['Alumni Talk', 'Workshop', 'Seminar', 'Events', 'Other'];
        const finalPurposeCategory = purposeCategory && validCategories.includes(purposeCategory) ? purposeCategory : 'Other';

        // Get the highest id and increment
        const lastBooking = await Booking.findOne({}, {}, { sort: { 'id': -1 } });
        const newId = lastBooking ? lastBooking.id + 1 : 1;
        
        // Get user role from MongoDB
        const user = await User.findOne({ email: email });
        
        // Updated Priority mapping and auto-approval logic
        const priorityMap = { secretary: 1, principal: 2, hod: 3, staff: 4 };
        const userPriority = user && priorityMap[user.role] ? priorityMap[user.role] : 99;
        let bookingStatus = 'pending';
        let approvedBy = null;
        let approvalDate = null;
        
        // New Priority Rules:
        // Secretary: Auto-approve (priority 1)
        // Principal: Auto-approve (priority 2) 
        // HOD: Manual approval by admin (priority 3)
        // Staff: Manual approval by admin (priority 4)
        if (user && (user.role === 'secretary' || user.role === 'principal')) {
            bookingStatus = 'confirmed';
            approvedBy = 'auto-approved';
            approvalDate = new Date().toISOString();
        }
        // HOD and Staff require manual admin approval
        else if (user && (user.role === 'hod' || user.role === 'staff')) {
            bookingStatus = 'pending'; // Will remain pending until admin approval
        }
        
        // Find all bookings for same venue/date/time
        const conflictingBookings = await Booking.find({
            venue: venue,
            date: date,
            time: time,
            status: { $ne: 'cancelled' }
        });
        
        // Check if any higher priority booking exists
        const higherExists = conflictingBookings.some(b => b.priority && b.priority < userPriority);
        
        // Only auto-approve if secretary/principal AND no higher priority conflicts
        if (bookingStatus === 'confirmed' && higherExists) {
            bookingStatus = 'pending'; // Demote to pending if conflicts exist
            approvedBy = null;
            approvalDate = null;
        }
        
        // If this booking is higher priority than any conflicting booking, move lower priority bookings
        if (conflictingBookings.length > 0 && bookingStatus === 'confirmed') {
            // Get all halls (venues) from existing bookings and a static list
            const allVenues = [
                'Main Hall', 'Conference Room', 'Auditorium', 'Seminar Hall', 'Lecture Hall 1', 'Lecture Hall 2', 'Lecture Hall 3', 'Lecture Hall 4'
            ];
            
            for (const conflict of conflictingBookings) {
                if (conflict.priority > userPriority) {
                    // Find an available hall for the lower priority booking
                    const bookedVenues = await Booking.find({
                        date: conflict.date,
                        time: conflict.time,
                        status: { $ne: 'cancelled' }
                    }).select('venue');
                    
                    const bookedVenueNames = bookedVenues.map(b => b.venue);
                    const availableVenues = allVenues.filter(v => !bookedVenueNames.includes(v));
                    
                    if (availableVenues.length > 0) {
                        // Move booking to first available hall
                        conflict.originalVenue = conflict.venue;
                        conflict.venue = availableVenues[0];
                        conflict.status = 'reassigned';
                        conflict.movedReason = `Booking moved due to higher priority booking by ${user.role}`;
                        await conflict.save();
                    } else {
                        // No available halls, cancel booking
                        conflict.originalVenue = conflict.venue;
                        conflict.status = 'cancelled';
                        conflict.movedReason = `Booking cancelled due to higher priority booking by ${user.role}`;
                        await conflict.save();
                    }
                }
            }
        }
        
        // Prevent overlap booking: same venue, date, and overlapping time
        const overlap = await Booking.findOne({
            venue: venue,
            date: date,
            time: time,
            status: { $ne: 'cancelled' }
        });
        
        if (overlap) {
            return res.status(409).json({ error: `Hall unavailable and already booked for ${venue} on ${date} at ${time}` });
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
            purposeCategory: finalPurposeCategory,
            status: bookingStatus,
            createdAt: new Date().toISOString(),
            priority: user && user.role === 'secretary' ? 1
                : user && user.role === 'principal' ? 2
                : user && user.role === 'hod' ? 3
                : user && user.role === 'staff' ? 4
                : 99, // lowest priority for others
            venueCapacity: VENUE_CAPACITIES[venue] || null,
            approvedBy: approvedBy,
            approvalDate: approvalDate
        });
        
        const savedBooking = await newBooking.save();
        
        let message = 'Booking created successfully';
        if (bookingStatus === 'confirmed') {
            if (user.role === 'secretary') {
                message = 'Booking auto-approved for Secretary';
            } else if (user.role === 'principal') {
                message = 'Booking auto-approved for Principal';
            }
        } else if (user && (user.role === 'hod' || user.role === 'staff')) {
            message = 'Booking submitted for admin approval';
        }
        
        res.status(201).json({ 
            success: true, 
            booking: savedBooking,
            message: message,
            autoApproved: bookingStatus === 'confirmed',
            requiresApproval: user && (user.role === 'hod' || user.role === 'staff')
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Update booking status (admin only)
app.patch('/api/bookings/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required (pending, confirmed, cancelled)' });
        }
        
        const updateFields = { 
            status: status,
            updatedAt: new Date().toISOString()
        };
        
        // If admin is approving a booking, record the approval details
        if (status === 'confirmed') {
            updateFields.approvedBy = req.user.email;
            updateFields.approvalDate = new Date().toISOString();
        }
        
        const booking = await Booking.findOneAndUpdate(
            { id: parseInt(id) },
            updateFields,
            { new: true }
        );
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        let message = `Booking status updated to ${status}`;
        if (status === 'confirmed') {
            message = `Booking approved by admin (${req.user.email})`;
        } else if (status === 'cancelled') {
            message = `Booking cancelled by admin (${req.user.email})`;
        }
        
        res.json({ 
            success: true, 
            booking: booking,
            message: message
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// Delete booking (admin only)
app.delete('/api/bookings/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBooking = await Booking.findOneAndDelete({ id: parseInt(id) });
        
        if (!deletedBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json({ 
            success: true, 
            booking: deletedBooking,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// Get booking statistics (admin only)
app.get('/api/bookings/stats', verifyAdmin, async (req, res) => {
    try {
        const total = await Booking.countDocuments();
        const confirmed = await Booking.countDocuments({ status: 'confirmed' });
        const pending = await Booking.countDocuments({ status: 'pending' });
        const cancelled = await Booking.countDocuments({ status: 'cancelled' });
        
        const stats = { total, confirmed, pending, cancelled };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Serve static files (after API routes to prevent conflicts)
app.use(express.static('.'));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Validate admin user setup
async function validateAdminSetup() {
    try {
        const adminUser = await User.findOne({ email: 'admin@msec.edu.in' });
        
        if (!adminUser) {
            console.error('❌ Admin user not found in MongoDB! Should be created by initializeUsers()');
        } else if (adminUser.role !== 'admin') {
            console.error('❌ Admin user role mismatch! Fixing...');
            adminUser.role = 'admin';
            await adminUser.save();
            console.log('✅ Admin user role fixed');
        } else {
            console.log('✅ Admin user verified: admin@msec.edu.in');
        }
        
        // Ensure no other users have admin role
        const otherAdmins = await User.find({ email: { $ne: 'admin@msec.edu.in' }, role: 'admin' });
        if (otherAdmins.length > 0) {
            console.warn('⚠️  Found other users with admin role, removing admin privileges...');
            for (const user of otherAdmins) {
                user.role = 'user';
                await user.save();
                console.log(`   - Removed admin role from: ${user.email}`);
            }
            console.log('✅ Admin privileges secured for admin@msec.edu.in only');
        }
    } catch (error) {
        console.error('Error validating admin setup:', error);
    }
}

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 MSEC Connect Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/bookings.html`);
    console.log(`📝 Booking Form: http://localhost:${PORT}/book.html`);
    console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
    console.log('');
    // Validate admin setup
    await validateAdminSetup();
    console.log('');
    // Print all current users from MongoDB
    try {
        const users = await User.find({});
        console.log('👥 Current User Credentials:');
        users.forEach(user => {
            console.log(`- ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}: ${user.email} / ${user.password}`);
        });
    } catch (err) {
        console.error('Error reading users from MongoDB:', err);
    }
});

module.exports = app;
