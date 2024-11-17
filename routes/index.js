const express = require("express");
const router = express.Router();
const { calculateDailyCalories } = require("../controllers/calorieController");

router.post("/calculate", calculateDailyCalories);

module.exports = router;
