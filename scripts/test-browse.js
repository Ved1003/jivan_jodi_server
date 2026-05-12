import fetch from 'node-fetch';

const testBrowse = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@jivanjodi.com',
                password: 'Test@123'
            })
        });

        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('❌ Login Failed:', loginData);
            return;
        }

        const token = loginData.data.accessToken;
        console.log('✅ Login successful. Token obtained.');

        console.log('2. Requesting Browse Profiles...');
        const browseRes = await fetch('http://localhost:5000/api/browse/profiles', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const browseData = await browseRes.json();

        if (!browseData.success) {
            console.error('❌ Browse Failed:', browseData);
            // Specifically print the message
            console.log('Server Error Message:', browseData.message);
        } else {
            console.log('✅ Browse Success!', browseData.data.length + ' profiles found.');
        }

    } catch (error) {
        console.error('❌ Script Error:', error.message);
    }
};

testBrowse();

