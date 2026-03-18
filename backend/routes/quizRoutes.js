const express = require("express");
const router = express.Router();

const {
  assignPal,
  resetStock,
  getStats
} = require("../services/distributionService");

// User submits quiz
router.post("/submit", (req, res) => {
  const { resultType } = req.body;

  const assigned = assignPal(resultType);

  if (!assigned) {
    return res.status(400).json({
      message: "No stock left"
    });
  }

  res.json({
    assignedPal: assigned
  });
});

// Admin reset
router.post("/admin/reset", (req, res) => {
  const { stock } = req.body;

  resetStock(stock);

  res.json({ message: "Stock reset successful" });
});

// Admin stats
router.get("/admin/stats", (req, res) => {
  res.json(getStats());
});

module.exports = router;