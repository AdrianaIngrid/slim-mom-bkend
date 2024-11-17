const Joi = require("joi");

const calculateSchema = Joi.object({
  height: Joi.number().positive().required(),
  desiredWeight: Joi.number().positive().required(),
  age: Joi.number().positive().required(),
  bloodType: Joi.number().integer().min(1).max(4).required(),
  currentWeight: Joi.number().positive().required(),
});
module.exports = calculateSchema;