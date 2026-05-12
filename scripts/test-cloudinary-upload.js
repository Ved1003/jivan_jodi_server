import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n📋 ===== CLOUDINARY CONFIGURATION TEST =====\n');

// Check environment variables
console.log('1️⃣  Environment Variables:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\n2️⃣  Cloudinary Configuration:');
const config = cloudinary.config();
console.log('   Cloud Name:', config.cloud_name || '❌ NOT CONFIGURED');
console.log('   API Key:', config.api_key ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');
console.log('   API Secret:', config.api_secret ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');

// Test API Connection
console.log('\n3️⃣  Testing Cloudinary API Connection...');
try {
    const result = await cloudinary.api.ping();
    console.log('   ✅ Cloudinary API Connection: SUCCESS');
    console.log('   Response:', result);
} catch (error) {
    console.log('   ❌ Cloudinary API Connection: FAILED');
    console.log('   Error:', error.message);
    console.log('   Status:', error.http_code);
}

// Test Upload Stream with Buffer
console.log('\n4️⃣  Testing Upload Stream with Buffer...');
try {
    const testImagePath = path.join(__dirname, '../public/images/logo.png');
    
    if (!fs.existsSync(testImagePath)) {
        console.log('   ⚠️  Test image not found at:', testImagePath);
        console.log('   Creating a minimal test buffer instead...');
        
        // Create a minimal valid PNG buffer (1x1 transparent pixel)
        const minimalPng = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82
        ]);
        
        console.log('   Test buffer size:', minimalPng.length, 'bytes');
        
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'jivan-jodi/test',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            
            uploadStream.on('error', reject);
            uploadStream.end(minimalPng);
        });
        
        const result = await uploadPromise;
        console.log('   ✅ Upload Stream Test: SUCCESS');
        console.log('   Uploaded URL:', result.secure_url);
        console.log('   Public ID:', result.public_id);
        
        // Cleanup test image
        await cloudinary.uploader.destroy(result.public_id).catch(err =>
            console.log('   Note: Could not delete test image:', err.message)
        );
    } else {
        const fileBuffer = fs.readFileSync(testImagePath);
        console.log('   Test image size:', fileBuffer.length, 'bytes');
        
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'jivan-jodi/test',
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            
            uploadStream.on('error', reject);
            uploadStream.end(fileBuffer);
        });
        
        const result = await uploadPromise;
        console.log('   ✅ Upload Stream Test: SUCCESS');
        console.log('   Uploaded URL:', result.secure_url);
        console.log('   Public ID:', result.public_id);
        
        // Cleanup
        await cloudinary.uploader.destroy(result.public_id).catch(err =>
            console.log('   Note: Could not delete test image:', err.message)
        );
    }
} catch (error) {
    console.log('   ❌ Upload Stream Test: FAILED');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
}

console.log('\n✅ ===== TEST COMPLETE =====\n');
