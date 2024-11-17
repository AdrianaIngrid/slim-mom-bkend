const services = require("../services/index");
const jwt = require("jsonwebtoken");
const Jimp = require("jimp");
const fs = require("fs").promises;
const path = require("path");
const avatarsDir = path.join(__dirname, "../public/avatars");
require("dotenv").config();
const secret = process.env.SECRET;
const User = require("../services/schemas/userSchema");
const { checkUserDB } = require("../services/index");
const uuidv4 = require("uuid");
const emailSchema = require("../services/schemas/emailSchema");

const createUserController = async (req, res, next) => {
  console.log("Request body:", req.body);
  try {
    const { email, password } = req.body;
     console.log("Calling createUser service...");
    const result = await services.createUser({ email, password });
     console.log("User created:", result);
    const payload = { id: result._id, email: result.email };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    console.log("JWT Secret:", secret);
    console.log("Generated Token:", token);
    
    result.token = token;
    await result.save();
    res.status(201).json({
      status: "success",
      code: 201,
      data: { email: result.email, token },
    });
  } catch (error) {
    next(error);
  }
};

const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await checkUserDB({
      email,
      password,
    });

    const payload = { id: result._id, email: result.email };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    result.token = token;
    await result.save();

    res.status(201).json({
      status: "succes",
      code: 201,
      data: {
        email: result.email,
        token,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      error: error.message,
    });
  }
};

const logoutController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
const currentUserController = (req, res) => {
  const { email, avatarURL } = req.user;

  res.status(200).json({
    email,
    avatarURL,
  });
};
const uploadAvatarController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(404).json({ error: "There is no file to upload" });
    }
    const { path: tmpPath, originalname } = req.file;
    const avatarName = `${req.user._id}-${
      Date.now() + path.extname(originalname)
    }`;
    const finalAvatarPath = path.join(avatarsDir, avatarName);
    const image = await Jimp.read(tmpPath);
    await image.resize(250, 250).writeAsync(finalAvatarPath);
    await fs.unlink(tmpPath);
    const avatarURL = `/public/avatars/${avatarName}`;
    await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });

    res.status(200).json({ avatarURL });
  } catch (error) {
    next(error);
  }
};
const verifyEmailController = async function (req, res, next) {
  console.log("Ruta de verificare a fost apelată.");
  const { verificationToken } = req.params;
  try {
    console.log(verificationToken);
    await services.verifyEmail(verificationToken);

    res.status(200).json({ message: "Verification successful", status: 200 });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};
const verificationEmailUserController = async (req, res) => {
  // Validare body
  const { error } = emailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "missing required field email" });
  }

  const { email } = req.body;

  try {
    // Caută utilizatorul
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verifică dacă utilizatorul este deja verificat
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    // Generează un token nou dacă nu există unul sau trimite tokenul existent
    const verificationToken = user.verificationToken || uuidv4();
    if (!user.verificationToken) {
      user.verificationToken = verificationToken;
      await user.save();
    }

    // Trimite emailul de verificare
    await services.sendVerificationEmail(email, verificationToken);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Eroare la retrimiterea emailului:", error.message);
    res
      .status(500)
      .json({ message: "Eroare la trimiterea emailului de verificare." });
  }
};

module.exports = {
  createUserController,
  loginUserController,
  logoutController,
  currentUserController,
  uploadAvatarController,
  verifyEmailController,
  verificationEmailUserController,
};
