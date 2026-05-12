import { pool } from '../config/database.js';
import { checkSubscriptionStatus } from '../utils/subscription.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Helper to safe parse preferences (handles JSON string, Array, or CSV string)
const parsePreferences = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(item => item.toLowerCase().trim());
    if (typeof val === 'string') {
        try {
            // Try parsing as JSON first
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed.map(item => item.toLowerCase().trim());
        } catch (e) {
            // If valid JSON parse fails, treat as CSV
        }
        return val.split(',').map(item => item.trim().toLowerCase());
    }
    return [];
};

// Helper function to calculate match percentage
const calculateMatchPercentage = (userPreferences, targetProfile) => {
    let totalScore = 0;
    let maxScore = 0;

    // Age match (20 points)
    maxScore += 20;
    if (userPreferences.age_min && userPreferences.age_max && targetProfile.age) {
        const age = targetProfile.age;
        if (age >= userPreferences.age_min && age <= userPreferences.age_max) {
            totalScore += 20;
        } else {
            // Partial score for close matches
            const diff = Math.min(
                Math.abs(age - userPreferences.age_min),
                Math.abs(age - userPreferences.age_max)
            );
            totalScore += Math.max(0, 20 - diff * 2);
        }
    }

    // Height match (15 points)
    maxScore += 15;
    if (userPreferences.height_min && userPreferences.height_max && targetProfile.height) {
        const heightValue = parseFloat(targetProfile.height);
        const minHeight = parseFloat(userPreferences.height_min);
        const maxHeight = parseFloat(userPreferences.height_max);

        if (heightValue >= minHeight && heightValue <= maxHeight) {
            totalScore += 15;
        }
    }

    // Education match (20 points)
    maxScore += 20;
    if (userPreferences.education && targetProfile.education) {
        const preferredEducations = parsePreferences(userPreferences.education);
        if (preferredEducations.includes('any') || preferredEducations.includes(targetProfile.education.toLowerCase())) {
            totalScore += 20;
        }
    }

    // Profession match (15 points)
    maxScore += 15;
    if (userPreferences.profession && targetProfile.profession) {
        const preferredProfessions = parsePreferences(userPreferences.profession);
        if (preferredProfessions.includes('any') || preferredProfessions.includes(targetProfile.profession.toLowerCase())) {
            totalScore += 15;
        }
    }

    // Religion match (20 points)
    maxScore += 20;
    if (userPreferences.religion && targetProfile.religion) {
        const preferredReligions = parsePreferences(userPreferences.religion);
        if (preferredReligions.includes('any') || preferredReligions.includes(targetProfile.religion.toLowerCase())) {
            totalScore += 20;
        }
    }

    // Location match (10 points)
    maxScore += 10;
    if (userPreferences.location && targetProfile.city) {
        const preferredLocations = parsePreferences(userPreferences.location);
        if (preferredLocations.includes('any') || preferredLocations.some(loc => targetProfile.city.toLowerCase().includes(loc) || targetProfile.state?.toLowerCase().includes(loc))) {
            totalScore += 10;
        }
    }

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

// Browse profiles with filters
export const browseProfiles = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const {
        ageMin,
        ageMax,
        heightMin,
        heightMax,
        religion,
        education,
        profession,
        city,
        state,
        maritalStatus,
        onlyBoosted,
        page = 1,
        limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    // Get user's gender to show opposite gender profiles
    const [currentUser] = await pool.query(
        'SELECT gender, looking_for, role FROM users WHERE id = ?',
        [userId]
    );

    if (currentUser.length === 0) {
        return next(new AppError('User not found', 404));
    }

    // Check if user is admin
    const isAdmin = currentUser[0].role === 'admin';

    // Build query
    let query = `
        SELECT 
            u.id as userId,
            p.first_name as firstName,
            p.last_name as lastName,
            TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
            p.height,
            p.education,
            p.profession,
            p.city,
            p.state,
            p.religion,
            p.marital_status as maritalStatus,
            p.profile_photo as profilePhoto,
            p.gallery_photos as galleryPhotos,
            u.created_at as createdAt,
            u.gender,
            (u.is_boosted = 1 AND u.boost_expires_at > NOW()) as isBoosted
        FROM users u
        INNER JOIN profiles p ON u.id = p.user_id
        WHERE u.status = 'active'
        AND u.id != ?
    `;

    const params = [userId];

    // Apply gender filter only for non-admin users
    if (!isAdmin) {
        const userGender = currentUser[0].gender;
        const oppositeGender = userGender === 'male' ? 'female' : 'male';
        query += ' AND u.gender = ?';
        params.push(oppositeGender);
    }

    // Exclude reported profiles
    query += `
        AND u.id NOT IN (
            SELECT reported_id FROM reports WHERE reporter_id = ?
        )
    `;
    params.push(userId);

    // Add filters
    if (ageMin) {
        query += ' AND TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) >= ?';
        params.push(parseInt(ageMin));
    }

    if (ageMax) {
        query += ' AND TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) <= ?';
        params.push(parseInt(ageMax));
    }

    if (heightMin) {
        query += ' AND CAST(p.height AS DECIMAL(3,1)) >= ?';
        params.push(parseFloat(heightMin));
    }

    if (heightMax) {
        query += ' AND CAST(p.height AS DECIMAL(3,1)) <= ?';
        params.push(parseFloat(heightMax));
    }

    if (religion) {
        query += ' AND p.religion = ?';
        params.push(religion);
    }



    if (education) {
        query += ' AND p.education LIKE ?';
        params.push(`%${education}%`);
    }

    if (profession) {
        query += ' AND p.profession LIKE ?';
        params.push(`%${profession}%`);
    }

    if (city) {
        query += ' AND p.city LIKE ?';
        params.push(`%${city}%`);
    }

    if (state) {
        query += ' AND p.state LIKE ?';
        params.push(`%${state}%`);
    }

    if (maritalStatus) {
        query += ' AND p.marital_status = ?';
        params.push(maritalStatus);
    }

    if (onlyBoosted === 'true' || onlyBoosted === true) {
        query += ' AND u.is_boosted = 1 AND u.boost_expires_at > NOW()';
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/s, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    query += ` 
        ORDER BY 
        (u.is_boosted = 1 AND u.boost_expires_at > NOW()) DESC, 
        u.created_at DESC 
        LIMIT ? OFFSET ?`;

    params.push(parseInt(limit), parseInt(offset));

    // Execute query
    const [profiles] = await pool.query(query, params);

    // Get user's partner preferences and interactions (simplified for brevity, assume helper functions or same logic)
    const [preferences] = await pool.query(
        'SELECT * FROM partner_preferences WHERE user_id = ?',
        [userId]
    );
    const userPreferences = preferences[0] || {};

    const [interactions] = await pool.query(
        `SELECT target_user_id, interaction_type 
         FROM profile_interactions 
         WHERE user_id = ? AND interaction_type IN ('shortlist', 'like')`,
        [userId]
    );

    const shortlistedIds = interactions
        .filter(i => i.interaction_type === 'shortlist')
        .map(i => i.target_user_id);

    const likedIds = interactions
        .filter(i => i.interaction_type === 'like')
        .map(i => i.target_user_id);

    const enrichedProfiles = profiles.map(profile => ({
        ...profile,
        matchPercentage: calculateMatchPercentage(userPreferences, profile),
        isShortlisted: shortlistedIds.includes(profile.userId),
        isLiked: likedIds.includes(profile.userId)
    }));

    res.json({
        success: true,
        data: enrichedProfiles,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

// Get detailed profile
export const getProfileDetails = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { userId: targetUserId } = req.params;

        // Get target user's complete profile
        const [users] = await pool.query(
            `SELECT
                u.id as userId,
                u.email,
                u.phone,
                u.gender,
                u.looking_for as lookingFor,
                p.*,
                TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = ? AND u.status = 'active'`,
            [targetUserId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const profile = users[0];

        // Get partner preferences
        const [preferences] = await pool.query(
            'SELECT * FROM partner_preferences WHERE user_id = ?',
            [targetUserId]
        );

        let isShortlisted = false;
        let isLiked = false;
        let matchPercentage = 0;
        let isSubscribed = false;
        let isOwner = false;
        let isAdmin = req.user?.role === 'admin';

        if (userId) {
            // Get user's own preferences for match calculation
            const [myPreferences] = await pool.query(
                'SELECT * FROM partner_preferences WHERE user_id = ?',
                [userId]
            );

            // Check if shortlisted or liked
            const [interactions] = await pool.query(
                `SELECT interaction_type 
                 FROM profile_interactions 
                 WHERE user_id = ? AND target_user_id = ? `,
                [userId, targetUserId]
            );

            isShortlisted = interactions.some(i => i.interaction_type === 'shortlist');
            isLiked = interactions.some(i => i.interaction_type === 'like');

            // Calculate match percentage
            matchPercentage = myPreferences[0]
                ? calculateMatchPercentage(myPreferences[0], profile)
                : 0;

            // Track profile view
            await pool.query(
                `INSERT INTO profile_interactions(user_id, target_user_id, interaction_type)
                VALUES(?, ?, 'view')
                ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
                [userId, targetUserId]
            );

            // Check if requesting user is subscribed
            isSubscribed = await checkSubscriptionStatus(userId);
            isOwner = parseInt(userId) === parseInt(targetUserId);
        }

        // Capture biodata existence before potentially deleting the URL
        const hasBiodata = !!profile.biodata_url;

        // Privacy checks
        if (!isSubscribed && !isOwner && !isAdmin) {
            // Free users or unauthenticated users cannot see contact details or biodata
            delete profile.whatsapp_number;
            delete profile.phone;
            delete profile.email;
            delete profile.biodata_url; // Hide biodata from free/guest users
        } else {
            // Premium users / Owner / Admin
            delete profile.email;
            delete profile.phone;
            // Keep whatsapp_number and biodata_url for premium users
        }

        res.json({
            success: true,
            data: {
                ...profile,
                has_biodata: hasBiodata,
                age: profile.age,
                matchPercentage,
                isShortlisted,
                isLiked,
                partnerPreferences: preferences[0] || null,
                viewerIsSubscribed: isSubscribed
            }
        });

    } catch (error) {
        console.error('Get profile details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile details'
        });
    }
};

// Add to shortlist
export const addToShortlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: targetUserId } = req.params;

        // Prevent self-shortlist
        if (userId === parseInt(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot shortlist your own profile'
            });
        }

        // Add to shortlist
        await pool.query(
            `INSERT INTO profile_interactions(user_id, target_user_id, interaction_type)
VALUES(?, ?, 'shortlist')
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
            [userId, targetUserId]
        );

        res.json({
            success: true,
            message: 'Profile added to shortlist'
        });

    } catch (error) {
        console.error('Add to shortlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to shortlist'
        });
    }
};

// Remove from shortlist
export const removeFromShortlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: targetUserId } = req.params;

        await pool.query(
            `DELETE FROM profile_interactions 
             WHERE user_id = ? AND target_user_id = ? AND interaction_type = 'shortlist'`,
            [userId, targetUserId]
        );

        res.json({
            success: true,
            message: 'Profile removed from shortlist'
        });

    } catch (error) {
        console.error('Remove from shortlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove from shortlist'
        });
    }
};

// Get shortlist
export const getShortlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.query(
            `SELECT
u.id as userId,
    p.first_name as firstName,
    p.last_name as lastName,
    TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
    p.height,
    p.education,
    p.profession,
    p.city,
    p.state,
    p.religion,
    p.profile_photo as profilePhoto,
    p.gallery_photos as galleryPhotos,
    pi.created_at as shortlistedAt
            FROM profile_interactions pi
            INNER JOIN users u ON pi.target_user_id = u.id
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE pi.user_id = ?
    AND pi.interaction_type = 'shortlist'
            AND u.status = 'active'
            ORDER BY pi.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: profiles,
            count: profiles.length
        });

    } catch (error) {
        console.error('Get shortlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shortlist'
        });
    }
};

// Send interest/like
export const sendLike = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: targetUserId } = req.params;

        // Prevent self-like
        if (userId === parseInt(targetUserId)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send interest to yourself'
            });
        }

        // Send like
        await pool.query(
            `INSERT INTO profile_interactions(user_id, target_user_id, interaction_type)
VALUES(?, ?, 'like')
             ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
            [userId, targetUserId]
        );

        res.json({
            success: true,
            message: 'Interest sent successfully'
        });

    } catch (error) {
        console.error('Send like error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send interest'
        });
    }
};

// Get sent interests
export const getSentLikes = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.query(
            `SELECT
u.id as userId,
    p.first_name as firstName,
    p.last_name as lastName,
    TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
    p.height,
    p.education,
    p.profession,
    p.city,
    p.profile_photo as profilePhoto,
    pi.created_at as sentAt
            FROM profile_interactions pi
            INNER JOIN users u ON pi.target_user_id = u.id
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE pi.user_id = ?
    AND pi.interaction_type = 'like'
            AND u.status = 'active'
            ORDER BY pi.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: profiles,
            count: profiles.length
        });

    } catch (error) {
        console.error('Get sent likes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sent interests'
        });
    }
};

// Get received interests
export const getReceivedLikes = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.query(
            `SELECT
u.id as userId,
    p.first_name as firstName,
    p.last_name as lastName,
    TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
    p.height,
    p.education,
    p.profession,
    p.city,
    p.profile_photo as profilePhoto,
    pi.created_at as receivedAt
            FROM profile_interactions pi
            INNER JOIN users u ON pi.user_id = u.id
            INNER JOIN profiles p ON u.id = p.user_id
            WHERE pi.target_user_id = ?
    AND pi.interaction_type = 'like'
            AND u.status = 'active'
            ORDER BY pi.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: profiles,
            count: profiles.length
        });

    } catch (error) {
        console.error('Get received likes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get received interests'
        });
    }
};

// Get featured profiles (5 male, 5 female) for public display
export const getFeaturedProfiles = async (req, res) => {
    try {
        const query = `
            (SELECT 
                u.id as userId, 
                u.gender, 
                p.first_name as firstName, 
                p.last_name as lastName, 
                p.profile_photo as profilePhoto, 
                p.city, 
                p.state,
                TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
                p.profession,
                p.religion
            FROM users u 
            JOIN profiles p ON u.id = p.user_id 
            WHERE u.status = 'active' AND u.gender = 'male' 
            LIMIT 5)
            UNION
            (SELECT 
                u.id as userId, 
                u.gender, 
                p.first_name as firstName, 
                p.last_name as lastName, 
                p.profile_photo as profilePhoto, 
                p.city, 
                p.state,
                TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
                p.profession,
                p.religion
            FROM users u 
            JOIN profiles p ON u.id = p.user_id 
            WHERE u.status = 'active' AND u.gender = 'female' 
            LIMIT 5)
    `;

        const [profiles] = await pool.query(query);


        res.json({
            success: true,
            data: profiles,
            total: profiles.length
        });
    } catch (error) {
        console.error('Get featured profiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured profiles'
        });
    }
};

// Get all members with sorting (public endpoint - no authentication required)
export const getAllMembers = async (req, res) => {
    try {
        const {
            ageMin,
            ageMax,
            religion,
            education,
            profession,
            city,
            gender,
            sortBy = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        const offset = (page - 1) * limit;

        // Build WHERE clause
        let whereClause = ' WHERE u.status = ?';
        const params = ['active'];

        if (ageMin) {
            whereClause += ' AND TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) >= ?';
            params.push(parseInt(ageMin));
        }
        if (ageMax) {
            whereClause += ' AND TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) <= ?';
            params.push(parseInt(ageMax));
        }
        if (religion) {
            whereClause += ' AND p.religion = ?';
            params.push(religion);
        }
        if (education) {
            whereClause += ' AND p.education LIKE ?';
            params.push(`%${education}%`);
        }
        if (profession) {
            whereClause += ' AND p.profession LIKE ?';
            params.push(`%${profession}%`);
        }
        if (city) {
            whereClause += ' AND (p.city LIKE ? OR p.state LIKE ?)';
            params.push(`%${city}%`, `%${city}%`);
        }
        if (gender && gender !== 'all') {
            whereClause += ' AND u.gender = ?';
            params.push(gender);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users u INNER JOIN profiles p ON u.id = p.user_id ${whereClause}`;
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Build main query
        let query = 'SELECT u.id as userId, p.first_name as firstName, p.last_name as lastName, ';
        query += 'TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age, ';
        query += 'p.height, p.education, p.profession, p.city, p.state, p.religion, ';
        query += 'p.marital_status as maritalStatus, p.profile_photo as profilePhoto, ';
        query += 'u.created_at as createdAt, u.gender, u.is_boosted as isBoosted ';
        query += 'FROM users u INNER JOIN profiles p ON u.id = p.user_id ';
        query += whereClause;

        // Add sorting
        switch (sortBy) {
            case 'oldest':
                query += ' ORDER BY u.created_at ASC';
                break;
            case 'age_asc':
                query += ' ORDER BY p.date_of_birth DESC';
                break;
            case 'age_desc':
                query += ' ORDER BY p.date_of_birth ASC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY u.created_at DESC';
                break;
        }

        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        const finalParams = [...params, parseInt(limit), parseInt(offset)];

        // Execute query
        const [profiles] = await pool.query(query, finalParams);

        // Format profiles for response
        const formattedProfiles = profiles.map(profile => ({
            id: profile.userId,
            userId: profile.userId,
            name: `${profile.firstName} ${profile.lastName}`,
            firstName: profile.firstName,
            lastName: profile.lastName,
            age: profile.age,
            location: `${profile.city || ''}, ${profile.state || ''}`.trim().replace(/^,|,$/g, ''),
            city: profile.city,
            state: profile.state,
            education: profile.education,
            profession: profile.profession,
            religion: profile.religion,
            profilePhoto: profile.profilePhoto,
            gender: profile.gender,
            isBoosted: Boolean(profile.isBoosted),
            isPremium: false
        }));

        res.json({
            success: true,
            data: formattedProfiles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get all members error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch members',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};