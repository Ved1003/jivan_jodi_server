import Joi from 'joi';

// Register validation schema
export const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name must not exceed 50 characters'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name must not exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address'
    }),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Please enter a valid 10-digit Indian phone number'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters'
    }),
    lookingFor: Joi.string().valid('bride', 'groom').required().messages({
        'any.only': 'Please select whether you are looking for a bride or groom',
        'string.empty': 'This field is required'
    })
});

// Login validation schema
export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email address'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});

// Validate request body
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        next();
    };
};
