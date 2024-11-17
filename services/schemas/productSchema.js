const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  categories: { type: String, required: true },
  weight: Number,
  calories: Number,
  groupBloodNotAllowed: [Boolean],
});
 module.exports = mongoose.model("Product", productSchema);