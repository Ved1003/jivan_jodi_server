import './src/config/env.js';
import fetch from 'node-fetch';

const testRefreshToken = async () => {
    console.log('\n🧪 Testing Complete Token Flow...\n');

    // Step 1: Login to get tokens
    console.log('Step 1: Logging in to get tokens...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'testuser@jivanjodi.com',
            password: 'Test@123'
        })
    });

    const loginData = await loginResponse.json();

    if (!loginData.success) {
        console.error('❌ Login failed:', loginData.message);
        return;
    }

    console.log('✅ Login successful!');
    const { accessToken, refreshToken } = loginData.data;
    console.log('  Access Token:', accessToken.substring(0, 30) + '...');
    console.log('  Refresh Token:', refreshToken.substring(0, 30) + '...');

    // Step 2: Use access token to get user data
    console.log('\nStep 2: Using access token to get user data...');
    const meResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const meData = await meResponse.json();
    console.log('✅ Got user data:', meData.success ? 'Success' : 'Failed');
    if (meData.success) {
        console.log('  User:', meData.data.email);
    }

    // Step 3: Use refresh token to get new access token
    console.log('\nStep 3: Using refresh token to get new access token...');
    const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    const refreshData = await refreshResponse.json();

    console.log('\nRefresh Token Response:');
    console.log('Status:', refreshResponse.status);
    console.log('Response:', JSON.stringify(refreshData, null, 2));

    if (refreshData.success) {
        console.log('\n✅ ✅ ✅ REFRESH TOKEN WORKS! ✅ ✅ ✅');
        console.log('New Access Token:', refreshData.data.accessToken.substring(0, 30) + '...');

        // Step 4: Use new access token
        console.log('\nStep 4: Testing new access token...');
        const newMeResponse = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${refreshData.data.accessToken}`
            }
        });

        const newMeData = await newMeResponse.json();
        console.log('✅ New access token works:', newMeData.success ? 'Yes!' : 'No');

    } else {
        console.log('\n❌ Refresh token failed:', refreshData.message);
    }
};

testRefreshToken().catch(console.error);
