const signUpSchema = require("../services/schemas/signUpSchema");

const validateSignUp = async (req, res, next) => {
  const { error } = signUpSchema.validate(req.body, { abortEarly: false }); // Verifică toate erorile
  if (error) {
    return res.status(400).json({
      status: "Bad request",
      code: 400,
      message: "Validation error",
      details: error.details.map((err) => ({
        message: err.message,
        path: err.path,
      })),
    });
  }
  next();
};

module.exports = validateSignUp;
