// Simple test to verify venue API endpoints
console.log('Testing venue endpoints...');

// Test using node-fetch for server communication
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testVenueEndpoints() {
    try {
        console.log('\n🏢 Testing Venue Endpoints...');
        
        // Test 1: Get all venues
        console.log('\n📋 Test 1: Get All Venues');
        const venuesResponse = await fetch('http://localhost:3000/api/venues');
        if (venuesResponse.ok) {
            const venuesData = await venuesResponse.json();
            console.log('✅ Successfully fetched venues:');
            console.log(`📊 Total venues: ${venuesData.count}`);
            venuesData.venues.forEach((venue, index) => {
                console.log(`   ${index + 1}. ${venue.venue}: ${venue.capacity} capacity`);
            });
        } else {
            console.log('❌ Failed to fetch venues:', venuesResponse.status);
        }
        
        // Test 2: Get venue recommendations for different attendee counts
        const testCounts = [25, 75, 150, 400];
        
        for (const count of testCounts) {
            console.log(`\n🎯 Test: Recommendations for ${count} attendees`);
            const recResponse = await fetch(`http://localhost:3000/api/venues/recommend/${count}`);
            if (recResponse.ok) {
                const recData = await recResponse.json();
                console.log(`✅ Found ${recData.venues.length} venue options:`);
                
                const suitable = recData.venues.filter(v => v.suitable);
                const unsuitable = recData.venues.filter(v => !v.suitable);
                
                if (suitable.length > 0) {
                    console.log('   🟢 Suitable venues:');
                    suitable.forEach(venue => {
                        console.log(`      - ${venue.venue} (${venue.capacity} capacity)`);
                    });
                }
                
                if (unsuitable.length > 0) {
                    console.log('   🔴 Insufficient capacity:');
                    unsuitable.forEach(venue => {
                        console.log(`      - ${venue.venue} (${venue.capacity} capacity)`);
                    });
                }
            } else {
                console.log(`❌ Failed to get recommendations for ${count}:`, recResponse.status);
            }
        }
        
        console.log('\n🎉 Venue endpoint testing completed!');
        
    } catch (error) {
        console.error('❌ Venue endpoint test failed:', error.message);
    }
}

testVenueEndpoints();