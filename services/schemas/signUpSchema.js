const Joi = require("joi");

const signUpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email invalid",
    "any.required": "Emailul este obligatoriu",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Parola trebuie sa contina minimum 6 caractere",
    "any.required": "Parola este obligatorie",
  }),
});
module.exports = signUpSchema;

