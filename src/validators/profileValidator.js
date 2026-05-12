import Joi from 'joi';

// Profile validation schema
export const profileSchema = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female').required(),
    height: Joi.string().optional(),
    bloodGroup: Joi.string().optional(),
    maritalStatus: Joi.string().optional(),
    religion: Joi.string().optional(),
    motherTongue: Joi.string().optional(),
    education: Joi.string().optional(),
    profession: Joi.string().optional(),
    company: Joi.string().optional(),
    annualIncome: Joi.string().optional(),
    fatherName: Joi.string().optional(),
    fatherOccupation: Joi.string().optional(),
    motherName: Joi.string().optional(),
    motherOccupation: Joi.string().optional(),
    siblings: Joi.string().optional(),
    familyType: Joi.string().optional(),
    hobbies: Joi.array().items(Joi.string()).optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().default('India'),
    bio: Joi.string().max(500).optional(),
    whatsappNumber: Joi.string().pattern(/^[0-9+\s-()]+$/).min(10).max(20).optional(),
    biodataUrl: Joi.string().uri().allow(null, '').optional(),
    // Added missing database fields to prevent validation errors
    diet: Joi.string().allow(null, '').optional(),
    drinking: Joi.string().allow(null, '').optional(),
    smoking: Joi.string().allow(null, '').optional(),
    weight: Joi.string().allow(null, '').optional(),
});

// Partner preferences validation schema
export const partnerPreferencesSchema = Joi.object({
    ageMin: Joi.number().min(18).max(100).optional(),
    ageMax: Joi.number().min(18).max(100).optional(),
    heightMin: Joi.string().optional(),
    heightMax: Joi.string().optional(),
    education: Joi.array().items(Joi.string()).optional(),
    profession: Joi.array().items(Joi.string()).optional(),
    religion: Joi.array().items(Joi.string()).optional(),
    location: Joi.array().items(Joi.string()).optional(),
    maritalStatus: Joi.array().items(Joi.string()).optional(),
    incomeRange: Joi.string().optional(),
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
