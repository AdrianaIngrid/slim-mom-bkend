const loginSchema = require("../services/schemas/loginSchema");
const loginValidate = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "Bad request",
      code: 400,
      message: "Joi library error",
      details: error.details,
    });
  }
  next();
};
module.exports = loginValidate;
