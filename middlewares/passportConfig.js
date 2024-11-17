const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../services/schemas/userSchema");
require("dotenv").config();
const secret = process.env.SECRET;
const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, async (payload, done) => {
    console.log("Payload JWT:", payload);
    try {
      const user = await User.findById(payload.id);
      if (!user) {
        console.log("User not found for ID:", payload.id);
        return done(null, false);
      }
      console.log("User authenticated:", user.email);
      return done(null, user); // Returnează utilizatorul găsit
    } catch (error) {
      console.error("Error in JWT Strategy:", err.message);
      return done(error, false);
    }
  })
);

module.exports = passport;
