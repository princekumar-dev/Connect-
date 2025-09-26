const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { User, Event, Booking } = require('./models');

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for migration');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

// Migration function
async function migrateData() {
    try {
        console.log('🚀 Starting data migration from JSON files to MongoDB...\n');

        // File paths
        const USERS_FILE = path.join(__dirname, 'users.json');
        const EVENTS_FILE = path.join(__dirname, 'events.json');
        const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

        // Migrate Users
        if (fs.existsSync(USERS_FILE)) {
            console.log('📁 Migrating users...');
            const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            
            if (usersData.users && usersData.users.length > 0) {
                // Clear existing users to avoid duplicates
                await User.deleteMany({});
                
                const migratedUsers = await User.insertMany(usersData.users);
                console.log(`✅ Migrated ${migratedUsers.length} users`);
            } else {
                console.log('📝 No users found in JSON file');
            }
        } else {
            console.log('❌ Users JSON file not found');
        }

        // Migrate Events
        if (fs.existsSync(EVENTS_FILE)) {
            console.log('\n📁 Migrating events...');
            const eventsData = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
            
            if (eventsData.events && eventsData.events.length > 0) {
                // Clear existing events to avoid duplicates
                await Event.deleteMany({});
                
                const migratedEvents = await Event.insertMany(eventsData.events);
                console.log(`✅ Migrated ${migratedEvents.length} events`);
            } else {
                console.log('📝 No events found in JSON file');
            }
        } else {
            console.log('❌ Events JSON file not found');
        }

        // Migrate Bookings
        if (fs.existsSync(BOOKINGS_FILE)) {
            console.log('\n📁 Migrating bookings...');
            const bookingsData = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
            
            if (bookingsData.bookings && bookingsData.bookings.length > 0) {
                // Clear existing bookings to avoid duplicates
                await Booking.deleteMany({});
                
                const migratedBookings = await Booking.insertMany(bookingsData.bookings);
                console.log(`✅ Migrated ${migratedBookings.length} bookings`);
            } else {
                console.log('📝 No bookings found in JSON file');
            }
        } else {
            console.log('❌ Bookings JSON file not found');
        }

        console.log('\n🎉 Migration completed successfully!');

        // Verify migration
        console.log('\n📊 Migration Summary:');
        const userCount = await User.countDocuments();
        const eventCount = await Event.countDocuments();
        const bookingCount = await Booking.countDocuments();
        
        console.log(`- Users in MongoDB: ${userCount}`);
        console.log(`- Events in MongoDB: ${eventCount}`);
        console.log(`- Bookings in MongoDB: ${bookingCount}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run migration
async function runMigration() {
    await connectDB();
    await migrateData();
}

// Check if running directly
if (require.main === module) {
    runMigration();
}

module.exports = { migrateData };