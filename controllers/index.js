const nutritionData = require("../models/products.json");
const History = require("../services/schemas/historySchema");
const ConsumedProduct = require("../services/schemas/consumedProductSchema");
const mongoose = require("mongoose");
const validateRequestBody = ({
  height,
  desiredWeight,
  age,
  bloodType,
  currentWeight,
  consumed,
}) => {
  if (
    !height ||
    !desiredWeight ||
    !age ||
    !bloodType ||
    !currentWeight ||
    typeof consumed === "undefined"
  ) {
    throw new Error(
      "All fields are required: height, desiredWeight, age, bloodType, currentWeight, consumed"
    );
  }
};
const calculateDailyCalories = async (req, res, next) => {
      console.log("Request body:", req.body);
  try {
    validateRequestBody(req.body);
const { height, desiredWeight, age, bloodType, consumed } =
  req.body;
   


    // Calculul BMR
    let bmr = 10 * desiredWeight + 6.25 * height - 5 * age - 161;

    // Ajustarea pentru nivel de activitate scazut
    const dailyCalories = Math.round(bmr * 1.2);

    const left = dailyCalories - consumed;
    const percentageOfNormal = Math.round((consumed / dailyCalories) * 100);
    const notRecommended = nutritionData
      .filter((product) => product.groupBloodNotAllowed[bloodType])
      .map((product) => ({
        title: product.title,
        categories: product.categories,
      }));

    res.status(200).json({
      status: "success",
      data: {
        dailyCalories,
        left,
        consumed,
        percentageOfNormal,
        notRecommended,
      },
    });
  } catch (error) {
    next(error);
  }
};



const calculateAndSaveDailyCalories = async (req, res, next) => {
  try {
    // Validează datele din cerere
    validateRequestBody(req.body);

    const { height, desiredWeight, age, bloodType, currentWeight, consumed } =
      req.body;

    // Calculul BMR
    let bmr = 10 * desiredWeight + 6.25 * height - 5 * age - 161;
    const dailyCalories = Math.round(bmr * 1.2);

    // Calculează caloriile rămase și procentul din normă
    const left = dailyCalories - consumed;
    const percentageOfNormal = Math.round((consumed / dailyCalories) * 100);

    // Generează lista de produse nerecomandate
    const notRecommended = nutritionData
      .filter((product) => product.groupBloodNotAllowed[bloodType])
      .map((product) => ({
        title: product.title,
        categories: product.categories,
      }));

    // Salvează datele în baza de date
    const userId = req.user._id; // Utilizatorul autentificat
    const newHistory = new History({
      userId,
      height,
      desiredWeight,
      age,
      bloodType,
      currentWeight,
      dailyCalories,
      notRecommended,
    });

    // Încearcă să salvezi în baza de date
    try {
      await newHistory.save();
    } catch (dbError) {
      return res.status(500).json({
        status: "error",
        message: "Failed to save history in the database",
        error: dbError.message,
      });
    }

    // Trimite răspunsul
    res.status(200).json({
      status: "success",
      data: {
        dailyCalories,
        left,
        consumed,
        percentageOfNormal,
        notRecommended,
      },
    });
  } catch (error) {
    next(error);
  }
};
// const searchProduct = (req, res) => {
//     const { query } = req.query;
//     console.log("Query received:", query);

//   if (!query) {
//     return res.status(400).json({
//       status: "error",
//       message: "Query parameter is required for search.",
//     });
//   }

//   const filteredProducts = nutritionData.filter(
//     (product) =>
//       product.title.toLowerCase().includes(query.toLowerCase()) ||
//       product.categories.toLowerCase().includes(query.toLowerCase())
//   );
// console.log("Filtered products:", filteredProducts);
//   if (filteredProducts.length === 0) {
//     return res.status(404).json({
//       status: "error",
//       message: "No products found matching the query.",
//     });
//   }

//   res.status(200).json({
//     status: "success",
//     data: filteredProducts.map((product) => ({
//       id: product._id ? product._id.$oid : null,
//       title: product.title,
//       categories: product.categories,
//       weight: product.weight,
//       calories: product.calories,
//     })),
//   });
// };
const searchProduct = async (req, res) => {
  const { query } = req.query;
  console.log("Query received:", query);

  if (!query) {
    return res.status(400).json({
      status: "error",
      message: "Query parameter is required for search.",
    });
  }

  try {
    const filteredProducts = await ConsumedProduct.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { categories: { $regex: query, $options: "i" } },
      ],
    });

    if (filteredProducts.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No products found matching the query.",
      });
    }

    res.status(200).json({
      status: "success",
      data: filteredProducts,
    });
  } catch (error) {
    console.error("Error in searchProduct:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const addConsumedProduct = async (req, res, next) => {
  try {
    const { productId, date, quantity } = req.body;

    // Validează datele de intrare
    if (!productId || !date || !quantity) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required: productId, date, quantity",
      });
    }

    // Găsește produsul în JSON
    const product = nutritionData.find((p) => p._id.$oid === productId);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Calculează caloriile pe baza cantității
    const calories = (quantity / product.weight) * product.calories;

    // Creează un nou document pentru produsul consumat
    const userId = req.user._id; // Preluat din middleware-ul `auth`
    const newConsumedProduct = new ConsumedProduct({
      userId,
      productId,
      date,
      quantity,
      calories,
    });

    // Salvează produsul în baza de date
    await newConsumedProduct.save();

    res.status(201).json({
      status: "success",
      data: {
        productId,
        date,
        quantity,
        calories,
      },
    });
  } catch (error) {
    next(error);
  }
};
const deleteConsumedProduct = async (req, res) => {
  let{ id } = req.params; // ID-ul produsului consumat
  console.log("ID primit:", id);

  try {
    // Verificăm dacă ID-ul este valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("ID invalid:", id);
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    // Convertim ID-ul într-un ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    console.log("ObjectId creat:", objectId);
    // Găsim și ștergem documentul
    const result = await ConsumedProduct.findByIdAndDelete(objectId);
console.log("Rezultatul ștergerii:", result);
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product deleted successfully", data: result });
  } catch (error) {
    console.error("Error in deleteConsumedProduct:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getDayInfo = async (req, res, next) => {
  const { date } = req.params; // Data primită ca parametru
  const userId = req.user._id; // ID-ul utilizatorului autentificat

  console.log("Data cerută:", date);
  console.log("Utilizator autentificat:", userId);

  try {
    // Găsim toate produsele consumate în acea zi pentru utilizatorul autentificat
    const consumedProducts = await ConsumedProduct.find({
      userId,
      date, // Căutăm după data exactă
    });

    if (consumedProducts.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No products found for date ${date}`,
      });
    }

    // Calculăm caloriile totale consumate
    const totalCalories = consumedProducts.reduce(
      (sum, product) => sum + product.calories,
      0
    );

    // Returnăm informațiile despre acea zi
    res.status(200).json({
      status: "success",
      data: {
        date,
        totalCalories,
        consumedProducts,
      },
    });
  } catch (error) {
    console.error("Error in getDayInfo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  calculateDailyCalories,
  calculateAndSaveDailyCalories,
  searchProduct,
  addConsumedProduct,
  deleteConsumedProduct,
  getDayInfo,
};
