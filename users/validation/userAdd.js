const joi = require("joi");
const { inputErr } = require("../../helpers/customError");
const userAddingSchema = joi.object({
  fullName: joi.string().min(1).required(),
  email : joi.string().email().required(),
  password: joi.string().regex(new RegExp('^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"<>,.?/_₹]).{8,}$')).required(),
  
});
const addValidation = async (req, res, next) => {
  try {
    const validated = await userAddingSchema.validateAsync(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error.isJoi) next(inputErr);
    next(error);
  }
};

module.exports = addValidation;
