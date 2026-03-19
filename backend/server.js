const express = require("express");
const path = require("path");
const quizRoutes = require("./routes/quizRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/quiz", quizRoutes);

const frontendPath = path.join(__dirname, "..", "public");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});