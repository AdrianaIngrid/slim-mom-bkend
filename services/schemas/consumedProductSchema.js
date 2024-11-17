const mongoose = require("mongoose");

const consumedProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: String, required: true },
  date: { type: String, required: true }, 
  quantity: { type: Number, required: true }, 
  calories: { type: Number, required: true }, 
});

module.exports = mongoose.model("ConsumedProduct", consumedProductSchema);
