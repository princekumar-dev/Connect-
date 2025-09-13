// ...existing code...
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000; // Changed default port to 3000

// Middleware
app.use(cors());
app.use(express.json());

// API routes should come before static file serving
// (Static middleware will be added after API routes)

// File paths for data storage
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const EVENTS_FILE = path.join(__dirname, 'events.json');

// Initialize data files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
    const initialUsers = {
        users: [
            { id: 1, email: 'admin@msec.edu.in', password: 'admin@123', name: 'Administrator', role: 'admin' },
            { id: 2, email: 'staff@msec.edu.in', password: 'staff@123', name: 'Staff', role: 'staff' },
            { id: 3, email: 'hod@msec.edu.in', password: 'hod@123', name: 'HOD', role: 'hod' },
            { id: 4, email: 'principal2msec.edu.in', password: 'principal@123', name: 'Principal', role: 'principal' },
            { id: 5, email: 'secretary@msec.edu.in', password: 'secretary@123', name: 'Secretary', role: 'secretary' }
        ]
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
}

if (!fs.existsSync(BOOKINGS_FILE)) {
    const initialBookings = {
        bookings: []
    };
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(initialBookings, null, 2));
}

if (!fs.existsSync(EVENTS_FILE)) {
    const initialEvents = {
        events: []
    };
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(initialEvents, null, 2));
}

// Helper functions
function readBookings() {
    try {
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading bookings:', error);
        return { bookings: [] };
    }
}

function readEvents() {
    try {
        const data = fs.readFileSync(EVENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading events:', error);
        return { events: [] };
    }
}

function writeEvents(data) {
    try {
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing events:', error);
        return false;
    }
}

function writeBookings(data) {
    try {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing bookings:', error);
        return false;
    }
}

function readUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return { users: [] };
    }
}

// Middleware to verify admin access
function verifyAdmin(req, res, next) {
    console.log('Headers received:', req.headers);
    const { userEmail } = req.headers;
    const userEmailLower = req.headers.useremail;
    const userEmailCapital = req.headers.UserEmail;
    
    console.log('Header variations:', { userEmail, userEmailLower, userEmailCapital });
    
    const actualUserEmail = userEmail || userEmailLower || userEmailCapital;
    
    if (!actualUserEmail) {
        console.log('Admin verification failed: No user email provided');
        console.log('Available headers:', Object.keys(req.headers));
        return res.status(401).json({ error: 'User email is required' });
    }
    
    // Explicit check for admin email
    if (actualUserEmail !== 'admin@msec.edu.in') {
        console.log('Admin verification failed: User is not admin:', actualUserEmail);
        return res.status(403).json({ error: 'Admin access required. Only admin@msec.edu.in is authorized.' });
    }
    
    const userData = readUsers();
    const user = userData.users.find(u => u.email === actualUserEmail && u.role === 'admin');
    
    if (!user) {
        console.log('Admin verification failed: User not found in database or role mismatch:', actualUserEmail);
        return res.status(403).json({ error: 'Admin access required. User not found or insufficient privileges.' });
    }
    
    console.log('Admin verification successful for:', actualUserEmail);
    req.user = user;
    next();
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

// Get all events
// Remove event (admin only)
app.delete('/api/event/:id', verifyAdmin, (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        if (!eventId) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        const data = readEvents();
        const eventIndex = data.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Event not found' });
        }
        data.events.splice(eventIndex, 1);
        if (writeEvents(data)) {
            res.json({ success: true, message: 'Event removed successfully' });
        } else {
            res.status(500).json({ error: 'Failed to remove event' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove event' });
    }
});
app.get('/api/event', (req, res) => {
    try {
        const data = readEvents();
        res.json({ success: true, events: data.events, count: data.events.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create new event (admin only)
app.post('/api/event', verifyAdmin, (req, res) => {
    try {
        const { name, date, time, desc, image } = req.body;
        if (!name || !date || !time || !desc || !image) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const data = readEvents();
        const newId = Math.max(...data.events.map(e => e.id || 0), 0) + 1;
        const newEvent = {
            id: newId,
            name,
            date,
            time,
            desc,
            image,
            createdAt: new Date().toISOString()
        };
        data.events.push(newEvent);
        if (writeEvents(data)) {
            res.status(201).json({ success: true, event: newEvent, message: 'Event uploaded successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save event' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload event' });
    }
});

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const userData = readUsers();
    const user = userData.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
        success: true, 
        user: userWithoutPassword,
        message: `Welcome ${user.name}!`
    });
});

// Get all bookings (admin only)
app.get('/api/bookings', verifyAdmin, (req, res) => {
    try {
        const data = readBookings();
        // Priority order: secretary > principal > hod > staff
        const priorityOrder = ['secretary', 'principal', 'hod', 'staff'];
        const users = readUsers().users;
        // Helper to get role for booking
        function getRole(email) {
            const user = users.find(u => u.email === email);
            return user ? user.role : '';
        }
        // Sort bookings by priority
        const sortedBookings = [...data.bookings].sort((a, b) => {
            const roleA = getRole(a.email);
            const roleB = getRole(b.email);
            const idxA = priorityOrder.indexOf(roleA);
            const idxB = priorityOrder.indexOf(roleB);
            // Lower index = higher priority
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
        res.json({ 
            success: true, 
            bookings: sortedBookings,
            count: sortedBookings.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get bookings by status (admin only)
app.get('/api/bookings/status/:status', verifyAdmin, (req, res) => {
    try {
        const { status } = req.params;
        const data = readBookings();
        const filteredBookings = data.bookings.filter(booking => booking.status === status);
        
        res.json({ 
            success: true, 
            bookings: filteredBookings,
            count: filteredBookings.length,
            status: status
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get user's own bookings (for regular users)
app.get('/api/user/bookings', (req, res) => {
    try {
        const userEmail = req.headers.useremail || req.headers.userEmail || req.headers['user-email'];
        
        if (!userEmail) {
            return res.status(401).json({ error: 'User email required' });
        }
        
        const data = readBookings();
        const userBookings = data.bookings.filter(booking => 
            booking.email && booking.email.toLowerCase() === userEmail.toLowerCase()
        );
        
        res.json({ 
            success: true, 
            bookings: userBookings,
            count: userBookings.length,
            userEmail: userEmail
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
});

// Create new booking
app.post('/api/bookings', (req, res) => {
    try {
        const { venue, date, time, attendees, organizer, email, purpose } = req.body;
        // Validate required fields
        if (!venue || !date || !time || !attendees || !organizer || !email || !purpose) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const data = readBookings();
        const newId = Math.max(...data.bookings.map(b => b.id), 0) + 1;
        // Get user role from users.json
        const users = readUsers().users;
        const user = users.find(u => u.email === email);
        // Priority mapping
        const priorityMap = { secretary: 1, principal: 2, hod: 3, staff: 4 };
        const userPriority = user && priorityMap[user.role] ? priorityMap[user.role] : 99;
        let bookingStatus = 'pending';
        // Find all bookings for same venue/date/time
        const conflictingBookings = data.bookings.filter(b =>
            b.venue === venue &&
            b.date === date &&
            b.time === time &&
            b.status !== 'cancelled'
        );
        // Check if any higher priority booking exists
        const higherExists = conflictingBookings.some(b => b.priority && b.priority < userPriority);
        if (userPriority === 1 || !higherExists) {
            bookingStatus = 'confirmed'; // Auto-approve if secretary or no higher priority exists
        }
        // If this booking is higher priority than any conflicting booking, move lower priority bookings
        if (conflictingBookings.length > 0 && bookingStatus === 'confirmed') {
            // Get all halls (venues) from existing bookings and a static list
            const allVenues = [
                'Main Hall', 'Conference Room', 'Auditorium', 'Seminar Hall', 'Lecture Hall 1', 'Lecture Hall 2', 'Lecture Hall 3', 'Lecture Hall 4'
            ];
            conflictingBookings.forEach(conflict => {
                if (conflict.priority > userPriority) {
                    // Find an available hall for the lower priority booking
                    const bookedVenues = data.bookings.filter(b =>
                        b.date === conflict.date &&
                        b.time === conflict.time &&
                        b.status !== 'cancelled'
                    ).map(b => b.venue);
                    const availableVenues = allVenues.filter(v => !bookedVenues.includes(v));
                    if (availableVenues.length > 0) {
                        // Move booking to first available hall
                        conflict.venue = availableVenues[0];
                        conflict.status = 'reassigned';
                        conflict.reassignedInfo = {
                            oldVenue: venue,
                            newVenue: availableVenues[0],
                            reason: `Booking moved due to higher priority booking by ${user.role}`,
                            movedAt: new Date().toISOString()
                        };
                    } else {
                        // No available halls, cancel booking
                        conflict.status = 'cancelled';
                        conflict.reassignedInfo = {
                            oldVenue: venue,
                            newVenue: null,
                            reason: `Booking cancelled due to higher priority booking by ${user.role}`,
                            movedAt: new Date().toISOString()
                        };
                    }
                }
            });
        }
        // Prevent overlap booking: same venue, date, and overlapping time
        const overlap = data.bookings.find(b =>
            b.venue === venue &&
            b.date === date &&
            b.status !== 'cancelled' &&
            b.time === time
        );
        if (overlap) {
            return res.status(409).json({ error: `Hall unavailable and already booked for ${venue} on ${date} at ${time}` });
        }
        const newBooking = {
            id: newId,
            venue,
            date,
            time,
            attendees: parseInt(attendees),
            organizer,
            email,
            purpose,
            status: bookingStatus,
            createdAt: new Date().toISOString(),
            priority: user && user.role === 'secretary' ? 1
                : user && user.role === 'principal' ? 2
                : user && user.role === 'hod' ? 3
                : user && user.role === 'staff' ? 4
                : 99 // lowest priority for others
        };
        data.bookings.push(newBooking);
        if (writeBookings(data)) {
            res.status(201).json({ 
                success: true, 
                booking: newBooking,
                message: bookingStatus === 'confirmed' ? 'Booking auto-approved for secretary or higher priority' : 'Booking created successfully'
            });
        } else {
            res.status(500).json({ error: 'Failed to save booking' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Update booking status (admin only)
app.patch('/api/bookings/:id/status', verifyAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required (pending, confirmed, cancelled)' });
        }
        
        const data = readBookings();
        const bookingIndex = data.bookings.findIndex(b => b.id === parseInt(id));
        
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        data.bookings[bookingIndex].status = status;
        data.bookings[bookingIndex].updatedAt = new Date().toISOString();
        
        if (writeBookings(data)) {
            res.json({ 
                success: true, 
                booking: data.bookings[bookingIndex],
                message: `Booking status updated to ${status}`
            });
        } else {
            res.status(500).json({ error: 'Failed to update booking' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// Delete booking (admin only)
app.delete('/api/bookings/:id', verifyAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const data = readBookings();
        const bookingIndex = data.bookings.findIndex(b => b.id === parseInt(id));
        
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const deletedBooking = data.bookings.splice(bookingIndex, 1)[0];
        
        if (writeBookings(data)) {
            res.json({ 
                success: true, 
                booking: deletedBooking,
                message: 'Booking deleted successfully'
            });
        } else {
            res.status(500).json({ error: 'Failed to delete booking' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// Get booking statistics (admin only)
app.get('/api/bookings/stats', verifyAdmin, (req, res) => {
    try {
        const data = readBookings();
        const stats = {
            total: data.bookings.length,
            confirmed: data.bookings.filter(b => b.status === 'confirmed').length,
            pending: data.bookings.filter(b => b.status === 'pending').length,
            cancelled: data.bookings.filter(b => b.status === 'cancelled').length
        };
        
        res.json({ success: true, stats });
    } catch (error) {
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
function validateAdminSetup() {
    const userData = readUsers();
    const adminUser = userData.users.find(u => u.email === 'admin@msec.edu.in');
    
    if (!adminUser) {
        console.error('❌ Admin user not found! Creating admin user...');
        userData.users.push({
            id: userData.users.length + 1,
            email: 'admin@msec.edu.in',
            password: 'admin@123',
            name: 'Administrator',
            role: 'admin'
        });
        fs.writeFileSync(USERS_FILE, JSON.stringify(userData, null, 2));
        console.log('✅ Admin user created successfully');
    } else if (adminUser.role !== 'admin') {
        console.error('❌ Admin user role mismatch! Fixing...');
        adminUser.role = 'admin';
        fs.writeFileSync(USERS_FILE, JSON.stringify(userData, null, 2));
        console.log('✅ Admin user role fixed');
    } else {
        console.log('✅ Admin user verified: admin@msec.edu.in');
    }
    
    // Ensure no other users have admin role
    const otherAdmins = userData.users.filter(u => u.email !== 'admin@msec.edu.in' && u.role === 'admin');
    if (otherAdmins.length > 0) {
        console.warn('⚠️  Found other users with admin role, removing admin privileges...');
        otherAdmins.forEach(user => {
            user.role = 'user';
            console.log(`   - Removed admin role from: ${user.email}`);
        });
        fs.writeFileSync(USERS_FILE, JSON.stringify(userData, null, 2));
        console.log('✅ Admin privileges secured for admin@msec.edu.in only');
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MSEC Connect Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/bookings.html`);
    console.log(`📝 Booking Form: http://localhost:${PORT}/book.html`);
    console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
    console.log('');
    // Validate admin setup
    validateAdminSetup();
    console.log('');
    // Print all current users from users.json
    try {
        const userData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        console.log('� Current User Credentials:');
        userData.users.forEach(user => {
            console.log(`- ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}: ${user.email} / ${user.password}`);
        });
    } catch (err) {
        console.error('Error reading users.json:', err);
    }
});

module.exports = app;
