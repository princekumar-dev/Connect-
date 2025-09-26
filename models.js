const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'staff', 'hod', 'principal', 'secretary'] }
}, {
    timestamps: true
});

// Event Schema
const eventSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() }
}, {
    timestamps: true
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    venue: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    attendees: { type: Number, required: true },
    organizer: { type: String, required: true },
    email: { type: String, required: true },
    purpose: { type: String, required: true },
    purposeCategory: { 
        type: String, 
        required: true, 
        enum: ['Alumni Talk', 'Workshop', 'Seminar', 'Events', 'Other'],
        default: 'Other'
    },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    priority: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    originalVenue: { type: String }, // For moved bookings
    movedReason: { type: String }, // Reason for venue change
    venueCapacity: { type: Number }, // Capacity of selected venue
    approvedBy: { type: String }, // Email of admin who approved (for manual approvals)
    approvalDate: { type: String } // Date when approved
}, {
    timestamps: true
});

// Create models
const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { User, Event, Booking };