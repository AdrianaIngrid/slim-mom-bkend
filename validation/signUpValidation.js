const { createUser } = require("../services/index");
const signUp = async (req, res, _) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};
module.exports = { signUp };
