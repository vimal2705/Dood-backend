require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dreamRoutes = require("./routes/dreamRoutes");
const actionRoutes = require("./routes/actionRoutes");
const taskRoutes = require("./routes/taskRoutes");
const ideaRoutes = require("./routes/ideaRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dreams", dreamRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/notes", noteRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Dood Backend API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
