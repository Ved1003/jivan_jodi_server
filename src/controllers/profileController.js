import { pool } from '../config/database.js';
import { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
    const fields = [
        'first_name', 'last_name', 'date_of_birth', 'gender', 'height',
        'religion', 'education', 'profession', 'city', 'state',
        'father_name', 'mother_name', 'profile_photo',
        'weight', 'diet', 'hobbies'
    ];

    const filledFields = fields.filter(field => profile[field] && profile[field] !== '').length;
    return Math.round((filledFields / fields.length) * 100);
};

// Create or update profile
export const createOrUpdateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        // ===== DEBUGGING: Log incoming data =====
        console.log('\n=== PROFILE UPDATE DEBUG ===');
        console.log('User ID:', userId);
        console.log('Profile Data Keys:', Object.keys(profileData));
        console.log('Date of Birth (raw):', profileData.dateOfBirth);
        console.log('===========================\n');

        // Check if profile exists
        const [existingProfile] = await pool.query(
            'SELECT id FROM profiles WHERE user_id = ?',
            [userId]
        );

        let result;

        if (existingProfile.length > 0) {
            // Update existing profile
            const updateFields = [];
            const updateValues = [];

            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== undefined && profileData[key] !== null) {
                    // Convert camelCase to snake_case
                    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

                    let value = profileData[key];

                    // Convert date format for date_of_birth
                    if (key === 'dateOfBirth' && value) {
                        try {
                            // Handle both ISO strings and yyyy-MM-dd formats
                            const date = new Date(value);
                            if (isNaN(date.getTime())) {
                                console.error('Invalid date value:', value);
                                return; // Skip this field
                            }
                            value = date.toISOString().split('T')[0];
                            console.log('Date converted:', value);
                        } catch (dateError) {
                            console.error('Date conversion error:', dateError, 'Original value:', value);
                            return; // Skip this field if conversion fails
                        }
                    }

                    updateFields.push(`${snakeKey} = ?`);
                    updateValues.push(typeof value === 'object' ? JSON.stringify(value) : value);
                }
            });

            if (updateFields.length > 0) {
                updateValues.push(userId);

                const updateQuery = `UPDATE profiles SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ?`;

                // ===== DEBUGGING: Log SQL query =====
                console.log('UPDATE Query:', updateQuery);
                console.log('UPDATE Values:', updateValues);
                console.log('===========================\n');

                try {
                    await pool.query(updateQuery, updateValues);
                } catch (sqlError) {
                    console.error('SQL UPDATE Error:', sqlError.message);
                    console.error('SQL Code:', sqlError.code);
                    console.error('SQL State:', sqlError.sqlState);
                    console.error('SQL Query:', updateQuery);
                    console.error('SQL Values:', updateValues);
                    throw sqlError;
                }
            }

            result = { profileId: existingProfile[0].id, action: 'updated' };
        } else {
            // Create new profile
            const fields = ['user_id'];
            const values = [userId];
            const placeholders = ['?'];

            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== undefined && profileData[key] !== null) {
                    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

                    let value = profileData[key];

                    // Convert date format for date_of_birth
                    if (key === 'dateOfBirth' && value) {
                        try {
                            const date = new Date(value);
                            if (isNaN(date.getTime())) {
                                console.error('Invalid date value:', value);
                                return;
                            }
                            value = date.toISOString().split('T')[0];
                            console.log('Date converted:', value);
                        } catch (dateError) {
                            console.error('Date conversion error:', dateError, 'Original value:', value);
                            return;
                        }
                    }

                    fields.push(snakeKey);
                    values.push(typeof value === 'object' ? JSON.stringify(value) : value);
                    placeholders.push('?');
                }
            });

            const insertQuery = `INSERT INTO profiles (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

            // ===== DEBUGGING: Log SQL query =====
            console.log('INSERT Query:', insertQuery);
            console.log('INSERT Values:', values);
            console.log('===========================\n');

            try {
                const [insertResult] = await pool.query(insertQuery, values);
                result = { profileId: insertResult.insertId, action: 'created' };
            } catch (sqlError) {
                console.error('SQL INSERT Error:', sqlError.message);
                console.error('SQL Code:', sqlError.code);
                console.error('SQL State:', sqlError.sqlState);
                console.error('SQL Query:', insertQuery);
                console.error('SQL Values:', values);
                throw sqlError;
            }
        }

        // Get updated profile with completion percentage
        const [profile] = await pool.query(
            'SELECT * FROM profiles WHERE user_id = ?',
            [userId]
        );

        const completion = calculateProfileCompletion(profile[0]);

        // Update profile completion
        await pool.query(
            'UPDATE profiles SET profile_completion = ? WHERE user_id = ?',
            [completion, userId]
        );

        console.log('✅ Profile saved successfully!');
        console.log('Profile ID:', result.profileId);
        console.log('Action:', result.action);
        console.log('Completion:', completion + '%\n');

        res.json({
            success: true,
            message: `Profile ${result.action} successfully`,
            data: {
                profileId: result.profileId,
                profileCompletion: completion
            }
        });

    } catch (error) {
        console.error('\n❌ CREATE/UPDATE PROFILE ERROR ❌');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Profile Data Received:', JSON.stringify(req.body, null, 2));

        if (error.sqlMessage) {
            console.error('SQL Error Message:', error.sqlMessage);
            console.error('SQL State:', error.sqlState);
            console.error('SQL Code:', error.code);
        }
        console.error('===========================\n');

        res.status(500).json({
            success: false,
            message: 'Failed to save profile',
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                sqlMessage: error.sqlMessage,
                sqlState: error.sqlState,
                code: error.code
            })
        });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const [profiles] = await pool.query(
            `SELECT p.*, u.email, u.phone, u.gender, u.looking_for, u.created_at as user_created_at
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            console.log(`⚠️ No profile found for user ${userId}, creating one now...`);
            // For users without a profile, create one
            // Get user basic info INCLUDING first_name and last_name from users table
            const [users] = await pool.query(
                'SELECT id, email, phone, first_name, last_name, gender, looking_for, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = users[0];

            // Create profile entry for this user with names from users table
            try {
                await pool.query(
                    'INSERT INTO profiles (user_id, first_name, last_name, profile_completion) VALUES (?, ?, ?, 0)',
                    [userId, user.first_name, user.last_name]
                );
                console.log(`✅ Created profile entry for user ${userId} with names from users table`);
            } catch (insertError) {
                console.error('Failed to create profile:', insertError);
            }

            // Return profile structure with names from users table
            return res.json({
                success: true,
                data: {
                    user_id: userId,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender,
                    looking_for: user.looking_for,
                    user_created_at: user.created_at,
                    // Use names from users table - they entered these during registration!
                    first_name: user.first_name,
                    last_name: user.last_name,
                    date_of_birth: null,
                    height: null,
                    weight: null,
                    blood_group: null,
                    religion: null,
                    mother_tongue: null,
                    marital_status: null,
                    education: null,
                    profession: null,
                    company: null,
                    annual_income: null,
                    city: null,
                    state: null,
                    father_name: null,
                    mother_name: null,
                    siblings: null,
                    family_type: null,
                    diet: null,
                    hobbies: [],
                    profile_photo: null,
                    gallery_photos: [],
                    biodata_url: null,
                    whatsapp_number: null,
                    profile_completion: 0
                }
            });
        }

        // Parse JSON fields safely
        const profile = profiles[0];
        console.log(`✅ Profile found for user ${userId}:`, {
            first_name: profile.first_name,
            last_name: profile.last_name,
            user_id: profile.user_id
        });
        try {
            if (profile.hobbies && typeof profile.hobbies === 'string') {
                profile.hobbies = JSON.parse(profile.hobbies);
            } else if (!profile.hobbies) {
                profile.hobbies = [];
            }

            if (profile.gallery_photos && typeof profile.gallery_photos === 'string') {
                profile.gallery_photos = JSON.parse(profile.gallery_photos);
            } else if (!profile.gallery_photos) {
                profile.gallery_photos = [];
            }
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Continue with empty arrays if parsing fails
            profile.hobbies = profile.hobbies || [];
            profile.gallery_photos = profile.gallery_photos || [];
        }

        res.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Get profile error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
    try {
        console.log('📷 Profile photo upload request received');
        console.log('User ID:', req.user?.id);
        console.log('File info:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;

        // Get existing profile photo to delete
        const [profile] = await pool.query(
            'SELECT profile_photo FROM profiles WHERE user_id = ?',
            [userId]
        );

        // Upload new photo to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file, 'profiles');

        // If profile doesn't exist, create it first
        if (profile.length === 0) {
            await pool.query(
                'INSERT INTO profiles (user_id, profile_photo) VALUES (?, ?)',
                [userId, uploadResult.url]
            );
        } else {
            // Update profile with new photo URL
            await pool.query(
                'UPDATE profiles SET profile_photo = ? WHERE user_id = ?',
                [uploadResult.url, userId]
            );
        }

        // Delete old photo from Cloudinary if exists
        if (profile.length > 0 && profile[0].profile_photo) {
            const oldPublicId = profile[0].profile_photo.split('/').pop().split('.')[0];
            if (oldPublicId) {
                await deleteFromCloudinary(`jivan-jodi/profiles/${oldPublicId}`).catch(err =>
                    console.error('Failed to delete old photo:', err)
                );
            }
        }

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: {
                url: uploadResult.url,
                publicId: uploadResult.publicId
            }
        });

    } catch (error) {
        console.error('❌ Upload profile photo error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile photo',
            ...(process.env.NODE_ENV === 'development' && { error: error.message, stack: error.stack })
        });
    }
};

// Upload biodata file
export const uploadBiodata = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;

        // Get existing biodata to delete
        const [profile] = await pool.query(
            'SELECT biodata_url FROM profiles WHERE user_id = ?',
            [userId]
        );

        // Upload new file to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file, 'biodata');

        // If profile doesn't exist, create it first
        if (profile.length === 0) {
            await pool.query(
                'INSERT INTO profiles (user_id, biodata_url) VALUES (?, ?)',
                [userId, uploadResult.url]
            );
        } else {
            // Update profile with new biodata URL
            await pool.query(
                'UPDATE profiles SET biodata_url = ? WHERE user_id = ?',
                [uploadResult.url, userId]
            );
        }

        // Delete old biodata from Cloudinary if exists
        if (profile.length > 0 && profile[0].biodata_url) {
            const oldPublicId = profile[0].biodata_url.split('/').pop().split('.')[0];
            if (oldPublicId) {
                // Determine if it was a raw file or image based on URL
                const resourceType = 'image';
                await deleteFromCloudinary(`jivan-jodi/biodata/${oldPublicId}`, resourceType).catch(err =>
                    console.error('Failed to delete old biodata:', err)
                );
            }
        }

        res.json({
            success: true,
            message: 'Biodata uploaded successfully',
            data: {
                url: uploadResult.url,
                publicId: uploadResult.publicId
            }
        });

    } catch (error) {
        console.error('Upload biodata error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload biodata',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Upload gallery photos
export const uploadGalleryPhotos = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const userId = req.user.id;

        // Check current gallery count
        const [profile] = await pool.query(
            'SELECT gallery_photos FROM profiles WHERE user_id = ?',
            [userId]
        );

        let currentGallery = [];

        // If profile doesn't exist, create it first
        if (profile.length === 0) {
            await pool.query(
                'INSERT INTO profiles (user_id, gallery_photos) VALUES (?, ?)',
                [userId, JSON.stringify([])]
            );
        } else if (profile[0].gallery_photos) {
            try {
                currentGallery = JSON.parse(profile[0].gallery_photos);
            } catch (e) {
                console.error('Error parsing gallery_photos:', e);
                currentGallery = [];
            }
        }

        // Limit to 5 photos total
        const remainingSlots = 5 - currentGallery.length;
        if (remainingSlots <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Gallery is full. Maximum 5 photos allowed.'
            });
        }

        const filesToUpload = req.files.slice(0, remainingSlots);

        // Upload photos to Cloudinary
        const uploadResults = await uploadMultipleToCloudinary(filesToUpload, 'gallery');

        // Add new photos to gallery
        const newPhotos = uploadResults.map(result => result.url);
        const updatedGallery = [...currentGallery, ...newPhotos];

        // Update profile
        await pool.query(
            'UPDATE profiles SET gallery_photos = ? WHERE user_id = ?',
            [JSON.stringify(updatedGallery), userId]
        );

        res.json({
            success: true,
            message: `${newPhotos.length} photo(s) uploaded successfully`,
            data: {
                gallery: updatedGallery,
                uploaded: newPhotos
            }
        });

    } catch (error) {
        console.error('Upload gallery photos error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload gallery photos',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Delete gallery photo
export const deleteGalleryPhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { photoUrl } = req.body;

        if (!photoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Photo URL is required'
            });
        }

        // Get current gallery
        const [profile] = await pool.query(
            'SELECT gallery_photos FROM profiles WHERE user_id = ?',
            [userId]
        );

        if (profile.length === 0 || !profile[0].gallery_photos) {
            return res.status(404).json({
                success: false,
                message: 'No gallery photos found'
            });
        }

        let gallery = JSON.parse(profile[0].gallery_photos);

        // Remove photo from gallery
        gallery = gallery.filter(url => url !== photoUrl);

        // Update profile
        await pool.query(
            'UPDATE profiles SET gallery_photos = ? WHERE user_id = ?',
            [JSON.stringify(gallery), userId]
        );

        // Delete from Cloudinary
        const publicId = photoUrl.split('/').pop().split('.')[0];
        if (publicId) {
            await deleteFromCloudinary(`jivan-jodi/gallery/${publicId}`).catch(err =>
                console.error('Failed to delete from Cloudinary:', err)
            );
        }

        res.json({
            success: true,
            message: 'Photo deleted successfully',
            data: { gallery }
        });

    } catch (error) {
        console.error('Delete gallery photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete photo'
        });
    }
};

// Create or update partner preferences
export const updatePartnerPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = req.body;

        // Check if preferences exist
        const [existing] = await pool.query(
            'SELECT id FROM partner_preferences WHERE user_id = ?',
            [userId]
        );

        // Convert arrays to JSON
        const jsonFields = ['education', 'profession', 'religion', 'location', 'maritalStatus'];
        jsonFields.forEach(field => {
            if (preferences[field]) {
                preferences[field] = JSON.stringify(preferences[field]);
            }
        });

        if (existing.length > 0) {
            // Update
            const updateFields = [];
            const updateValues = [];

            Object.keys(preferences).forEach(key => {
                if (preferences[key] !== undefined) {
                    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    updateFields.push(`${snakeKey} = ?`);
                    updateValues.push(preferences[key]);
                }
            });

            if (updateFields.length > 0) {
                updateValues.push(userId);
                await pool.query(
                    `UPDATE partner_preferences SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
                    updateValues
                );
            }
        } else {
            // Insert
            const fields = ['user_id'];
            const values = [userId];
            const placeholders = ['?'];

            Object.keys(preferences).forEach(key => {
                if (preferences[key] !== undefined) {
                    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    fields.push(snakeKey);
                    values.push(preferences[key]);
                    placeholders.push('?');
                }
            });

            await pool.query(
                `INSERT INTO partner_preferences (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
                values
            );
        }

        res.json({
            success: true,
            message: 'Partner preferences saved successfully'
        });

    } catch (error) {
        console.error('Update partner preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save partner preferences'
        });
    }
};

// Delete/Deactivate user profile (soft delete)
export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Deletion reason is required'
            });
        }

        // Update user status to inactive and store deletion info
        await pool.query(
            `UPDATE users 
             SET status = 'inactive', 
                 deletion_reason = ?, 
                 deleted_at = NOW() 
             WHERE id = ?`,
            [reason.trim(), userId]
        );

        console.log(`✅ User ${userId} profile deleted. Reason: ${reason}`);

        res.json({
            success: true,
            message: 'Profile deleted successfully. We\'re sorry to see you go.'
        });

    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile. Please try again.'
        });
    }
};


// Get partner preferences
export const getPartnerPreferences = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;

        const [preferences] = await pool.query(
            'SELECT * FROM partner_preferences WHERE user_id = ?',
            [userId]
        );

        if (preferences.length === 0) {
            // Return default empty preferences instead of 404
            return res.json({
                success: true,
                data: {
                    user_id: userId,
                    age_min: 18,
                    age_max: 35,
                    height_min: "5'0\"",
                    height_max: "6'0\"",
                    education: [],
                    profession: [],
                    religion: [],
                    location: [],
                    marital_status: [],
                    income: 'Any'
                }
            });
        }

        // Parse JSON fields
        const prefs = preferences[0];
        console.log('📋 Raw partner preferences from DB:', prefs);
        console.log('📍 Raw location field:', prefs.location, 'Type:', typeof prefs.location);

        const jsonFields = ['education', 'profession', 'religion', 'location', 'marital_status'];
        jsonFields.forEach(field => {
            if (prefs[field]) {
                // MySQL returns JSON columns as already-parsed objects/arrays
                // Only parse if it's a string
                if (typeof prefs[field] === 'string') {
                    try {
                        prefs[field] = JSON.parse(prefs[field]);
                    } catch (e) {
                        console.error(`Error parsing ${field}:`, e);
                        prefs[field] = [];
                    }
                } else if (Array.isArray(prefs[field])) {
                    // Already an array, no parsing needed
                } else {
                    // Some other type, convert to array
                    prefs[field] = [prefs[field]];
                }
            } else {
                prefs[field] = [];
            }
        });

        res.json({
            success: true,
            data: prefs
        });

    } catch (error) {
        console.error('Get partner preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get partner preferences',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

