const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const passport = require("./middlewares/passportConfig");

const app = express();
app.use(passport.initialize());
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;