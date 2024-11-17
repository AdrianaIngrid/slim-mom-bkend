const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const tmpDir = path.join(__dirname, "../tmp");

const {
  createUserController,
  loginUserController,
  logoutController,
  currentUserController,
  uploadAvatarController,
  verifyEmailController,
  verificationEmailUserController,
} = require("../controllers/authController");
const validateSignUp = require("../middlewares/validateSignUp");
const loginValidate = require("../middlewares/validateLogin");
const { auth } = require("../middlewares/auth");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}+${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

router.post("/signup", validateSignUp, createUserController);
router.post("/login", loginValidate, loginUserController);
router.get("/logout", auth, logoutController);
router.get("/current", auth, currentUserController);
router.patch("/avatars", auth, upload.single("avatar"), uploadAvatarController);
router.get("/verify/:verificationToken", verifyEmailController);
router.post("/verify", verificationEmailUserController);

module.exports = router;
