const express = require("express");
const router = express.Router();

const {
  assignPal,
  resetStock,
  getStats
} = require("../services/distributionService");

router.post("/assign", (req, res) => {
  const scores = req.body?.scores || {};
  const answerHistory = Array.isArray(req.body?.answerHistory) ? req.body.answerHistory : [];

  const palKeys = ["perry", "ping", "ola", "ty", "sky", "tobi", "iggy"];
  const maxScore = Math.max(...palKeys.map((key) => Number(scores[key] || 0)));
  const tied = palKeys.filter((key) => Number(scores[key] || 0) === maxScore);

  let resultType = tied[0];
  for (let i = answerHistory.length - 1; i >= 0; i -= 1) {
    if (tied.includes(answerHistory[i])) {
      resultType = answerHistory[i];
      break;
    }
  }

  const assigned = assignPal(resultType);

  if (!assigned) {
    return res.status(400).json({ message: "No stock left" });
  }

  res.json({ assignedPal: assigned });
});

router.post("/admin/reset", (req, res) => {
  const { stock } = req.body;
  resetStock(stock);
  res.json({ message: "Stock reset successful" });
});

router.get("/admin/stats", (req, res) => {
  res.json(getStats());
});

module.exports = router;