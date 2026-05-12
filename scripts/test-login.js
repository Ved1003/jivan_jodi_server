import './src/config/env.js';

const testLogin = async () => {
    console.log('\n🧪 Testing Login API...\n');

    const loginData = {
        email: 'john@example.com',  // Change this to your registered email
        password: 'test123'          // Change this to your password
    };

    console.log('Sending login request with:', loginData);

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        console.log('\nStatus:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ Login successful!');
            console.log('User ID:', data.data.userId);
            console.log('Role:', data.data.role);
            console.log('Status:', data.data.status);
            console.log('Access Token:', data.data.accessToken.substring(0, 50) + '...');
        } else {
            console.log('\n❌ Login failed');
            console.log('Error:', data.message);
            if (data.error) {
                console.log('Details:', data.error);
            }
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
};

// Import node-fetch for Node.js
import fetch from 'node-fetch';

testLogin();
