const mongoose = require('mongoose');
const { User, Event, Booking } = require('./models');
require('dotenv').config();

async function testMongoDB() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected for testing');

        // Test Users
        console.log('\n📁 Testing Users Collection:');
        const users = await User.find({});
        console.log(`Found ${users.length} users in database`);
        users.forEach(user => {
            console.log(`- ${user.role}: ${user.email}`);
        });

        // Test Events
        console.log('\n📁 Testing Events Collection:');
        const events = await Event.find({});
        console.log(`Found ${events.length} events in database`);

        // Test Bookings
        console.log('\n📁 Testing Bookings Collection:');
        const bookings = await Booking.find({});
        console.log(`Found ${bookings.length} bookings in database`);

        // Test creating a sample booking
        console.log('\n🧪 Testing Booking Creation:');
        const testBooking = new Booking({
            id: 999,
            venue: 'Test Hall',
            date: '2024-01-01',
            time: '10:00 AM',
            attendees: 50,
            organizer: 'Test Organizer',
            email: 'admin@msec.edu.in',
            purpose: 'Test Purpose',
            status: 'pending',
            priority: 1,
            createdAt: new Date().toISOString()
        });

        const savedBooking = await testBooking.save();
        console.log('✅ Test booking created successfully:', savedBooking.id);

        // Clean up test booking
        await Booking.deleteOne({ id: 999 });
        console.log('✅ Test booking cleaned up');

        console.log('\n🎉 All MongoDB operations working correctly!');

    } catch (error) {
        console.error('❌ MongoDB test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

testMongoDB();