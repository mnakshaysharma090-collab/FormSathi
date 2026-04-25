const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const formRoutes = require("./routes/formRoutes");

app.use("/api/form", formRoutes);
app.use("/generated", express.static(path.join(__dirname, "generated")));

app.get("/", (req, res) => {
  res.send("Legal Form AI backend is running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
