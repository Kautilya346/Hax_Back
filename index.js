import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./Controllers/auth.controllers.js";
import serviceRoutes from "./Controllers/service.controller.js";
import connectDB from "./Utils/db.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();
connectDB();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);

app.use("/service", serviceRoutes);

// Server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
