const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  calculateDailyCalories,
  calculateAndSaveDailyCalories,
  searchProduct,
  addConsumedProduct,
  deleteConsumedProduct,
  getDayInfo,
} = require("../controllers/index");

router.post("/calculate", calculateDailyCalories);
router.post("/daily-calories", auth, calculateAndSaveDailyCalories);
router.get("/products/search", auth, searchProduct);
router.post("/products/consumed", auth, addConsumedProduct);
router.delete("/products/consumed/:id", auth, deleteConsumedProduct);
/**
 * @swagger
 * /products/day/{date}:
 *   get:
 *     summary: Obține toate produsele consumate într-o anumită zi
 *     description: Returnează toate produsele consumate într-o anumită zi, precum și caloriile totale.
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data pentru care sunt căutate informațiile (format YYYY-MM-DD).
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token pentru autentificare.
 *     responses:
 *       200:
 *         description: Succes. Returnează informațiile despre ziua respectivă.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "2024-11-17"
 *                     totalCalories:
 *                       type: number
 *                       example: 960
 *                     consumedProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64ba1c458fb12f3d4a7711e2"
 *                           userId:
 *                             type: string
 *                             example: "64ba1c458fb12f3d4a7711e1"
 *                           productId:
 *                             type: string
 *                             example: "64ba1c458fb12f3d4a7711d0"
 *                           date:
 *                             type: string
 *                             example: "2024-11-17"
 *                           quantity:
 *                             type: number
 *                             example: 150
 *                           calories:
 *                             type: number
 *                             example: 300
 *       401:
 *         description: Autentificare eșuată. Token lipsă sau invalid.
 *       404:
 *         description: Nicio informație găsită pentru data specificată.
 *       500:
 *         description: Eroare internă de server.
 */
router.get("/day/:date", auth, getDayInfo);
module.exports = router;
