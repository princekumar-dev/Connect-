const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
    try {
        console.log('Testing venue recommendations API...');
        
        // Test venue recommendations for 50 attendees
        const response = await fetch('http://localhost:3000/api/venues/recommend/50');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Venue recommendations for 50 attendees:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Failed to get venue recommendations:', response.status);
        }
        
        // Test all venues endpoint
        const venuesResponse = await fetch('http://localhost:3000/api/venues');
        if (venuesResponse.ok) {
            const venuesData = await venuesResponse.json();
            console.log('\n✅ All venues:');
            console.log(JSON.stringify(venuesData, null, 2));
        } else {
            console.log('❌ Failed to get all venues:', venuesResponse.status);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

testAPI();