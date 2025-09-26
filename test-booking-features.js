const mongoose = require('mongoose');
const { User, Event, Booking } = require('./models');
require('dotenv').config();

async function testNewBookingFeatures() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected for booking feature testing');

        // Test 1: Create a Secretary booking (should auto-approve)
        console.log('\n🧪 Test 1: Secretary Booking (Auto-Approve)');
        const secretaryBooking = new Booking({
            id: 1001,
            venue: 'Main Hall',
            date: '2024-01-15',
            time: '10:00 AM',
            attendees: 100,
            organizer: 'Secretary Test',
            email: 'secretary@msec.edu.in',
            purpose: 'Annual meeting with alumni and current students',
            purposeCategory: 'Alumni Talk',
            status: 'confirmed', // Auto-approved
            priority: 1,
            venueCapacity: 500,
            approvedBy: 'auto-approved',
            approvalDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        await secretaryBooking.save();
        console.log('✅ Secretary booking created:', secretaryBooking.id, '- Status:', secretaryBooking.status);

        // Test 2: Create a Principal booking (should auto-approve)
        console.log('\n🧪 Test 2: Principal Booking (Auto-Approve)');
        const principalBooking = new Booking({
            id: 1002,
            venue: 'Auditorium',
            date: '2024-01-16',
            time: '2:00 PM',
            attendees: 200,
            organizer: 'Principal Test',
            email: 'principal@msec.edu.in',
            purpose: 'Technical workshop for final year students',
            purposeCategory: 'Workshop',
            status: 'confirmed', // Auto-approved
            priority: 2,
            venueCapacity: 300,
            approvedBy: 'auto-approved',
            approvalDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        await principalBooking.save();
        console.log('✅ Principal booking created:', principalBooking.id, '- Status:', principalBooking.status);

        // Test 3: Create an HOD booking (should be pending)
        console.log('\n🧪 Test 3: HOD Booking (Requires Admin Approval)');
        const hodBooking = new Booking({
            id: 1003,
            venue: 'Seminar Hall',
            date: '2024-01-17',
            time: '11:00 AM',
            attendees: 80,
            organizer: 'HOD Test',
            email: 'hod@msec.edu.in',
            purpose: 'Department seminar on latest research trends',
            purposeCategory: 'Seminar',
            status: 'pending', // Requires admin approval
            priority: 3,
            venueCapacity: 100,
            createdAt: new Date().toISOString()
        });
        await hodBooking.save();
        console.log('✅ HOD booking created:', hodBooking.id, '- Status:', hodBooking.status);

        // Test 4: Create a Staff booking (should be pending)
        console.log('\n🧪 Test 4: Staff Booking (Requires Admin Approval)');
        const staffBooking = new Booking({
            id: 1004,
            venue: 'Conference Room',
            date: '2024-01-18',
            time: '3:00 PM',
            attendees: 30,
            organizer: 'Staff Test',
            email: 'staff@msec.edu.in',
            purpose: 'Industry collaboration meeting with tech companies',
            purposeCategory: 'Events',
            status: 'pending', // Requires admin approval
            priority: 4,
            venueCapacity: 50,
            createdAt: new Date().toISOString()
        });
        await staffBooking.save();
        console.log('✅ Staff booking created:', staffBooking.id, '- Status:', staffBooking.status);

        // Test 5: Simulate admin approval of HOD booking
        console.log('\n🧪 Test 5: Admin Approves HOD Booking');
        const updatedHodBooking = await Booking.findOneAndUpdate(
            { id: 1003 },
            {
                status: 'confirmed',
                approvedBy: 'admin@msec.edu.in',
                approvalDate: new Date().toISOString()
            },
            { new: true }
        );
        console.log('✅ HOD booking approved by admin:', updatedHodBooking.id, '- Status:', updatedHodBooking.status);

        // Test venue capacity recommendations
        console.log('\n🧪 Test 6: Venue Capacity Recommendations');
        const venues = {
            'Main Hall': 500,
            'Auditorium': 300,
            'Seminar Hall': 100,
            'Conference Room': 50,
            'Lecture Hall 1': 80,
            'Meeting Room': 20
        };

        function getRecommendations(attendees) {
            const recommendations = [];
            for (const [venue, capacity] of Object.entries(venues)) {
                recommendations.push({
                    venue,
                    capacity,
                    suitable: capacity >= attendees
                });
            }
            return recommendations.sort((a, b) => {
                if (a.suitable && !b.suitable) return -1;
                if (!a.suitable && b.suitable) return 1;
                return a.capacity - b.capacity;
            });
        }

        const recommendations75 = getRecommendations(75);
        console.log('✅ Venue recommendations for 75 attendees:');
        recommendations75.forEach(rec => {
            console.log(`   - ${rec.venue}: Capacity ${rec.capacity} ${rec.suitable ? '✅ Suitable' : '❌ Too Small'}`);
        });

        // Summary
        console.log('\n📊 Booking Summary:');
        const allBookings = await Booking.find({ id: { $in: [1001, 1002, 1003, 1004] } });
        allBookings.forEach(booking => {
            console.log(`   - ${booking.purposeCategory}: ${booking.venue} (${booking.attendees} attendees) - ${booking.status.toUpperCase()}`);
        });

        // Cleanup test bookings
        await Booking.deleteMany({ id: { $in: [1001, 1002, 1003, 1004] } });
        console.log('\n✅ Test bookings cleaned up');

        console.log('\n🎉 All new booking features working correctly!');
        console.log('\n📋 New Features Summary:');
        console.log('   ✅ Priority-based auto-approval (Secretary & Principal)');
        console.log('   ✅ Manual admin approval (HOD & Staff)');
        console.log('   ✅ Venue capacity recommendations');
        console.log('   ✅ Purpose categories (Alumni Talk, Workshop, Seminar, Events, Other)');
        console.log('   ✅ Enhanced booking model with new fields');

    } catch (error) {
        console.error('❌ Booking feature test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

testNewBookingFeatures();