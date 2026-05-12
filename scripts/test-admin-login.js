import './src/config/env.js';
import fetch from 'node-fetch';

const testAdminLogin = async () => {
    console.log('\n🧪 Testing Admin Login...\n');

    const loginData = {
        email: 'admin@jivanjodi.com',
        password: 'admin123'
    };

    console.log('Admin Credentials:');
    console.log('  Email:', loginData.email);
    console.log('  Password:', loginData.password);
    console.log('\nSending request to /api/auth/admin/login...\n');

    try {
        const response = await fetch('http://localhost:5000/api/auth/admin/login', {
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
            console.log('\n✅ ✅ ✅ ADMIN LOGIN SUCCESSFUL! ✅ ✅ ✅\n');
            console.log('Admin Details:');
            console.log('  User ID:', data.data.userId);
            console.log('  Email:', data.data.email);
            console.log('  Role:', data.data.role);
            console.log('\nTokens:');
            console.log('  Access Token:', data.data.accessToken.substring(0, 50) + '...');
            console.log('  Refresh Token:', data.data.refreshToken.substring(0, 50) + '...');
        } else {
            console.log('\n❌ Admin login failed:', data.message);
        }

    } catch (error) {
        console.error('\n❌ Request failed:', error.message);
    }
};

testAdminLogin();
