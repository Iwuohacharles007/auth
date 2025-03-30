const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().trim().regex(/^[a-zA-Z\s]+$/).required().messages({
            'string.empty': 'Title is required',
            'string.pattern.base': 'Title must contain only alphabetic characters',
        }),
        price: Joi.number().min(0).required().messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price must be greater than or equal to 0',
            'any.required': 'Price is required',
        }),
        image: Joi.string().uri().required().messages({
            'string.uri': 'Image URL must be a valid URL',
        }),
        location: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    body: Joi.string().trim().required(),
    rating: Joi.number().min(1).max(5).required(),
    author: Joi.string().trim().required(),
});
