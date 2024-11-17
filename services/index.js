
const  User  = require("./schemas/userSchema");
const bcrypt = require("bcrypt");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const { v4: uuidv4 } = require("uuid");


// Users
const getAllUsers = async () => {
  return User.find();
};
const createUser = async ({ email, password }) => {
  try {
    const userExistent = await User.findOne({ email });

    if (userExistent) {
      const error = new Error("Acest email există deja.");
      error.statusCode = 409;
      throw error;
    }

    const codUnicDeVerificare = uuidv4();
    const linkDeVerificare = `http://localhost:3000/api/verify/${encodeURIComponent(
      codUnicDeVerificare
    )}`;
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
    });

    console.log(codUnicDeVerificare);
    await mg.messages.create(
      "sandbox49647d84044f43b2bda8589a0068a842.mailgun.org",
      {
        from: "Nahut Adriana Ingrid <mailgun@sandbox49647d84044f43b2bda8589a0068a842.mailgun.org>",
        to: [email],
        subject: "Email de verificare cont!",
        text: `Codul de verificare este: ${codUnicDeVerificare}\nPentru a-ți verifica contul, accesează linkul următor: ${linkDeVerificare}`,
        html: `
      <p>Codul de verificare este: <strong>${codUnicDeVerificare}</strong></p>
      <p>Pentru a-ți verifica contul, accesează linkul următor:</p>
      <a href="${linkDeVerificare}">Verifică contul</a>
    `,
      }
    );
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      verificationToken: codUnicDeVerificare,
    });

    return await newUser.save();
  } catch (error) {
    console.error("Eroare la crearea utilizatorului:", error.message);
    throw error;
  }
};
const checkUserDB = async ({ email, password }) => {
  try {
    console.log(`Parola:${password}`);
    const user = await User.findOne({ email });

    if (!user || !user.validPassword(password)) {
      throw new Error("Email sau parola gresita!");
    }
    if (!user.verify) {
      throw new Error("You must verify your email");
    }

    return user;
  } catch (error) {
    console.error("Eroare la verificarea utilizatorului:", error.message);
    throw error;
  }
};
const verifyEmail = async (verificationToken) => {
  const update = { verify: true, verificationToken: null };

  const result = await User.findOneAndUpdate(
    {
      verificationToken,
    },
    { $set: update },
    { new: true }
  );
  console.log(result);
  if (!result) throw new Error("User not found");
};
const sendVerificationEmail = async (email, verificationToken) => {
  const linkDeVerificare = `http://localhost:3000/api/verify/${verificationToken}`;
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  await mg.messages.create(
    "sandbox49647d84044f43b2bda8589a0068a842.mailgun.org",
    {
      from: "Nahut Adriana Ingrid <mailgun@sandbox49647d84044f43b2bda8589a0068a842.mailgun.org>",
      to: [email],
      subject: "Email de verificare cont!",
      text: `Codul de verificare este: ${verificationToken}\nPentru a-ți verifica contul, accesează linkul următor: ${linkDeVerificare}`,
      html: `
      <p>Codul de verificare este: <strong>${verificationToken}</strong></p>
      <p>Pentru a-ți verifica contul, accesează linkul următor:</p>
      <a href="${linkDeVerificare}">Verifică contul</a>
    `,
    }
  );
};
module.exports = {
  
  createUser,
  getAllUsers,
  checkUserDB,
  verifyEmail,
  sendVerificationEmail,
};
