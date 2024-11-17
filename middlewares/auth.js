const passport = require("passport");

const auth = async (req, res, next) => {
   console.log("Authorization Header:", req.headers.authorization);
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    console.log("User authenticated:", user.email);
    req.user = user;
    
    next();
  })(req, res, next);
};

module.exports = {
  auth,
};
