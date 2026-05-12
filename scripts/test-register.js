import '../config/env.js';
import fetch from 'node-fetch';

const testRegistration = async () => {
    console.log('\n🧪 Testing Registration API...\n');

    const testUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '9876543210',
        password: 'test123',
        lookingFor: 'bride'
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ Registration successful!');
            console.log('User ID:', data.data.userId);
            console.log('Access Token:', data.data.accessToken.substring(0, 50) + '...');
        } else {
            console.log('\n❌ Registration failed');
            console.log('Error:', data.message);
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
};

testRegistration();
