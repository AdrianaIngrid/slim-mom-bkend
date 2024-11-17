const Joi = require("joi");
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email invalid",
    "any.required": "Emailul este obligatoriu",
  }),
  password: Joi.string()
    .required()
    .messages({ "any.required": "Parola este obligatorie" }),
});
module.exports = loginSchema;
