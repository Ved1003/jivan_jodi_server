import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateToken, hashToken, formatPhone, generateOTP } from '../utils/helpers.js';
import { sendVerificationEmail, sendPasswordResetOTP, sendPasswordChangedEmail, sendPendingApprovalEmail } from '../utils/email.js';
import { checkSubscriptionStatus } from '../utils/subscription.js';

// Register new user
export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, lookingFor } = req.body;

        // Format phone number
        const formattedPhone = formatPhone(phone);

        // Check if user already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR phone = ?',
            [email, formattedPhone]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Auto-detect gender based on lookingFor
        // Looking for bride = User is male (groom)
        // Looking for groom = User is female (bride)
        const gender = lookingFor === 'bride' ? 'male' : 'female';

        // Generate verification token
        const verificationToken = generateToken();
        const hashedToken = hashToken(verificationToken);
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user with verification token, auto-detected gender, and names
        const [result] = await pool.query(
            `INSERT INTO users (email, phone, first_name, last_name, password_hash, looking_for, gender, status, verification_token, verification_token_expires) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
            [email, formattedPhone, firstName, lastName, passwordHash, lookingFor, gender, hashedToken, tokenExpires]
        );

        const userId = result.insertId;

        console.log('📝 Creating profile for new user:', { userId, firstName, lastName });

        // Create basic profile entry with first and last name
        try {
            // Validate that firstName and lastName are not empty
            if (!firstName || !lastName) {
                console.error('❌ firstName or lastName is missing!', { firstName, lastName });
                throw new Error('First name and last name are required');
            }

            const [profileResult] = await pool.query(
                `INSERT INTO profiles (user_id, first_name, last_name, profile_completion) 
                 VALUES (?, ?, ?, 0)`,
                [userId, firstName, lastName]
            );
            console.log('✅ Profile created successfully:', {
                profileId: profileResult.insertId,
                userId,
                firstName,
                lastName
            });
        } catch (profileError) {
            console.error('❌ Failed to create profile entry:', profileError);
            console.error('Profile creation data:', { userId, firstName, lastName });
            // Continue even if profile creation fails
        }

        // Send verification email (don't wait for it)
        const fullName = `${firstName} ${lastName}`;
        sendVerificationEmail(email, fullName, verificationToken).catch(err =>
            console.error('Failed to send verification email:', err)
        );

        // Generate tokens
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                userId,
                email,
                phone: formattedPhone,
                lookingFor,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.email_verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first. Check your inbox for the verification link.',
                needsEmailVerification: true
            });
        }

        // Admin approval removed - users are active after email verification

        // Check if user is blocked or suspended
        if (user.status === 'blocked') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact support for assistance.'
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support for assistance.'
            });
        }

        // Check if account was rejected
        if (user.status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Your account application was not approved. Please contact support for more information.'
            });
        }

        // Check if account is inactive (deleted)
        if (user.status === 'inactive') {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated. Please contact support if you wish to reactivate your account.'
            });
        }

        // Only approved users can login
        if (user.status !== 'approved' && user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account status does not allow login. Please contact support.'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Get profile completion status
        const [profiles] = await pool.query(
            'SELECT profile_completion FROM profiles WHERE user_id = ?',
            [user.id]
        );

        // Check subscription status
        const isSubscribed = await checkSubscriptionStatus(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                lookingFor: user.looking_for,
                emailVerified: user.email_verified,
                profileCompletion: profiles.length > 0 ? profiles[0].profile_completion : 0,
                isSubscribed,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Admin login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get admin user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND role = ?',
            [email, 'admin']
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const admin = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [admin.id]
        );

        // Generate tokens
        const accessToken = generateAccessToken(admin.id, 'admin');
        const refreshToken = generateRefreshToken(admin.id);

        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                userId: admin.id,
                email: admin.email,
                role: admin.role,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Get current user
export const getMe = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.email, u.phone, u.gender, u.role, u.status, u.looking_for, u.email_verified, u.created_at,
              u.is_boosted, u.boost_expires_at, u.boost_started_at,
              p.profile_completion, p.first_name, p.last_name, p.profile_photo, p.date_of_birth,
              p.city, p.state, p.education, p.profession, p.religion,
              s.start_date as subscription_start_date, s.end_date as subscription_end_date, s.plan_id
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active' AND s.end_date > NOW()
       WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isSubscribed = await checkSubscriptionStatus(req.user.id);

        // Check if boost is still active
        const user = users[0];
        const isBoosted = user.is_boosted && user.boost_expires_at && new Date(user.boost_expires_at) > new Date();

        // Calculate profile completion
        const requiredFields = [
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'date_of_birth', label: 'Date of Birth' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'education', label: 'Education' },
            { key: 'profession', label: 'Profession' },
            { key: 'religion', label: 'Religion' }
        ];

        const missingFields = requiredFields
            .filter(field => !user[field.key] || user[field.key] === '')
            .map(field => field.label);

        const filledFieldsCount = requiredFields.length - missingFields.length;
        const completionPercentage = Math.round((filledFieldsCount / requiredFields.length) * 100);
        const isProfileComplete = completionPercentage === 100;

        res.json({
            success: true,
            data: {
                ...user,
                isSubscribed,
                isBoosted,
                boostExpiresAt: user.boost_expires_at,
                boostStartedAt: user.boost_started_at,
                subscriptionStartDate: user.subscription_start_date,
                subscriptionEndDate: user.subscription_end_date,
                profileCompletion: {
                    isComplete: isProfileComplete,
                    completionPercentage,
                    missingFields
                }
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
};


// Refresh access token
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user
        const [users] = await pool.query(
            'SELECT id, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(users[0].id, users[0].role);

        res.json({
            success: true,
            data: { accessToken }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

// Verify email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        // Hash the token to compare with database
        const hashedToken = hashToken(token);

        // Find user with this token
        const [users] = await pool.query(
            `SELECT id, email FROM users 
             WHERE verification_token = ? 
             AND verification_token_expires > NOW()
             AND email_verified = FALSE`,
            [hashedToken]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        const user = users[0];

        // Update user as verified and active
        await pool.query(
            `UPDATE users 
             SET email_verified = TRUE, 
                 status = 'active',
                 verification_token = NULL, 
                 verification_token_expires = NULL 
             WHERE id = ?`,
            [user.id]
        );

        res.json({
            success: true,
            message: 'Email verified successfully! You can now login to your account.'
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Email verification failed. Please try again.'
        });
    }
};

// Resend verification email
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT id, email, email_verified FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = generateToken();
        const hashedToken = hashToken(verificationToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update token in database
        await pool.query(
            `UPDATE users 
             SET verification_token = ?, 
                 verification_token_expires = ? 
             WHERE id = ?`,
            [hashedToken, expiresAt, user.id]
        );

        // Send verification email
        await sendVerificationEmail(user.email, 'User', verificationToken);

        res.json({
            success: true,
            message: 'Verification email sent! Please check your inbox.'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification email. Please try again.'
        });
    }
};

// Send OTP for password reset
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT id, email FROM users WHERE email = ?',
            [email]
        );

        // Always return success to prevent email enumeration
        if (users.length === 0) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, an OTP has been sent.'
            });
        }

        const user = users[0];

        // Generate 6-digit OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database (plain text, it's only 6 digits and expires quickly)
        await pool.query(
            `UPDATE users 
             SET password_reset_token = ?, 
                 password_reset_expires = ? 
             WHERE id = ?`,
            [otp, expiresAt, user.id]
        );

        // Send OTP email
        await sendPasswordResetOTP(user.email, 'User', otp);

        res.json({
            success: true,
            message: 'If an account exists with this email, an OTP has been sent.'
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
};

// Verify OTP and reset password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Find user with this OTP
        const [users] = await pool.query(
            `SELECT id, email FROM users 
             WHERE email = ?
             AND password_reset_token = ? 
             AND password_reset_expires > NOW()`,
            [email, otp]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        const user = users[0];

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        await pool.query(
            `UPDATE users 
             SET password_hash = ?, 
                 password_reset_token = NULL, 
                 password_reset_expires = NULL 
             WHERE id = ?`,
            [passwordHash, user.id]
        );

        // Send confirmation email
        await sendPasswordChangedEmail(user.email, 'User');

        res.json({
            success: true,
            message: 'Password reset successfully! You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed. Please try again.'
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user
        const [users] = await pool.query(
            'SELECT password_hash, email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [passwordHash, userId]
        );

        // Send confirmation email (optional)
        try {
            await sendPasswordChangedEmail(user.email);
        } catch (emailError) {
            console.error('Failed to send password changed email:', emailError);
        }

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password'
        });
    }
};
