require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models/indexModel");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);

// Error Handler (Keep this after all routes)
app.use(errorHandler);

/* Sync Tables */
db.sequelize.sync({ alter: true })  // auto create / update tables
    .then(() => console.log("Tables created ✅"))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
