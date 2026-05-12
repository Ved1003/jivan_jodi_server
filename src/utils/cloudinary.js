import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Import and configure Cloudinary
import '../config/cloudinary.js';

// Configure multer to use memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Multer upload configuration
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// File filter for biodata (images and PDFs)
const biodataFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, WEBP and PDF files are allowed!'), false);
    }
};

export const biodataUpload = multer({
    storage: storage,
    fileFilter: biodataFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for biodata
    },
});

// Upload single image to Cloudinary
export const uploadToCloudinary = async (file, folder = 'profiles') => {
    return new Promise((resolve, reject) => {
        try {
            // Validate file exists and has buffer
            if (!file || !file.buffer) {
                return reject(new Error('File or file buffer is missing'));
            }

            console.log('🔄 Starting Cloudinary upload:', {
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.buffer.length,
                folder: folder
            });

            const isPdf = file.mimetype === 'application/pdf';
            const options = {
                folder: `jivan-jodi/${folder}`,
                resource_type: 'image', // Use 'image' for both images and PDFs to allow browser preview
            };

            if (!isPdf) {
                options.transformation = [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ];
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Cloudinary upload successful:', result.secure_url);
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                        });
                    }
                }
            );

            uploadStream.on('error', (error) => {
                console.error('❌ Upload stream error:', error);
                reject(error);
            });

            uploadStream.end(file.buffer);
        } catch (err) {
            console.error('❌ Cloudinary upload exception:', err);
            reject(err);
        }
    });
};

// Upload multiple images to Cloudinary
export const uploadMultipleToCloudinary = async (files, folder = 'gallery') => {
    const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
    return Promise.all(uploadPromises);
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Delete multiple images from Cloudinary
export const deleteMultipleFromCloudinary = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        console.error('Error deleting multiple from Cloudinary:', error);
        throw error;
    }
};
