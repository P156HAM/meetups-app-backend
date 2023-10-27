const Joi = require('joi')

const generateValidationMiddleware = (schema) => ({
    before: async (request) => {
        try {
            const body = JSON.parse(request.event.body);

            const { error } = schema.validate(body);
            if (error) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Validation error',
                        details: error.details.map((detail) => detail.message),
                    }),
                };
            }

            return request.response;
        } catch (parseError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid JSON format in the request body',
                    details: parseError.message,
                }),
            };
        }
    },
});

const userSchema = Joi.object({
    userName: Joi.string().max(50).required(),
    password: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
}).options({ abortEarly: false });

export const validateUserInput = generateValidationMiddleware(userSchema);

const userSchemaLogin = Joi.object({
    userName: Joi.string().max(50).required(),
    password: Joi.string().max(50).required(),
}).options({ abortEarly: false });

export const validateUserInputLogin = generateValidationMiddleware(userSchemaLogin);

const meetupSchema = Joi.object({
    name: Joi.string().max(50).required(),
}).options({ abortEarly: false });

export const validateMeetupInput = generateValidationMiddleware(meetupSchema);

const feedbackSchema = Joi.object({
    name: Joi.string().max(50).required(),
    rating: Joi.number().min(1).max(5).required(),
    feedback: Joi.string().max(300).required(),
}).options({ abortEarly: false });

export const validateFeedbackInput = generateValidationMiddleware(feedbackSchema);