const mongoose = require("mongoose");
const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  height: { type: Number, required: true },
  desiredWeight: { type: Number, required: true },
  age: { type: Number, required: true },
  bloodType: { type: Number, required: true },
  currentWeight: { type: Number, required: true },
  dailyCalories: { type: Number, required: true },
  notRecommended: [{ title: String, categories: String }],
  createdAt: { type: Date, default: Date.now },
});

const History = mongoose.model("History", historySchema);

module.exports = History;