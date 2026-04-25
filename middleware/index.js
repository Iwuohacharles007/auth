const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');

const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required(),
        location: Joi.string().required()
    }).required(),
    deleteImages: Joi.array().items(Joi.string()).optional() // ← ADD THIS
});

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports = { validateCampground };
