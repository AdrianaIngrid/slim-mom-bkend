const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: { type: String, minLength: 2 },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: function () {
        return !this.verify; // Este obligatoriu doar dacă utilizatorul nu este verificat
      },
    },
  },
  {
   
    collection: "slim-mom", // Numele colecției
  },

);

userSchema.methods.setPassword = function (password) {
  console.log(this);
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(6));
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
userSchema.pre("save", function (next) {
  if (!this.avatarURL) {
    this.avatarURL = gravatar.url(
      this.email,
      { s: 250, r: "pg", d: "wavatar" },
      true
    );
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
