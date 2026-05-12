import fetch from 'node-fetch';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzM0MjkwMywiZXhwIjoxNzY3MzQzODAzfQ.b8TC5q2MIjSW90E1uzjA9GetDNCroVmR22Fqq0s_n4s';

const testAdminBlogs = async () => {
    console.log('Testing GET http://localhost:5000/api/admin/blogs...');
    try {
        const response = await fetch('http://localhost:5000/api/admin/blogs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (data.success && Array.isArray(data.data)) {
            console.log('Ensure response.data.data has items:', data.data.length);
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

testAdminBlogs();
