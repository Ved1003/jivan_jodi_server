import './src/config/env.js';
import fetch from 'node-fetch';

const testLoginNow = async () => {
    console.log('\n🧪 Testing Login with Test User...\n');

    const loginData = {
        email: 'testuser@jivanjodi.com',
        password: 'Test@123'
    };

    console.log('Credentials:');
    console.log('  Email:', loginData.email);
    console.log('  Password:', loginData.password);
    console.log('\nSending request...\n');

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        console.log('Status Code:', response.status);
        console.log('\nResponse:');
        console.log(JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ ✅ ✅ LOGIN SUCCESSFUL! ✅ ✅ ✅\n');
            console.log('User Details:');
            console.log('  User ID:', data.data.userId);
            console.log('  Email:', data.data.email);
            console.log('  Role:', data.data.role);
            console.log('  Status:', data.data.status);
            console.log('  Profile Completion:', data.data.profileCompletion + '%');
            console.log('\nTokens:');
            console.log('  Access Token:', data.data.accessToken.substring(0, 50) + '...');
            console.log('  Refresh Token:', data.data.refreshToken.substring(0, 50) + '...');
        } else {
            console.log('\n❌ Login failed:', data.message);
            if (data.error) {
                console.log('Error details:', data.error);
            }
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
};

testLoginNow();
