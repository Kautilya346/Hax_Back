import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./Controllers/auth.controllers.js";
import serviceRoutes from "./Controllers/service.controller.js";
import projectRoutes from "./Controllers/project.controllers.js";
import transactionRoutes from "./Controllers/transactions.controllers.js";
import profileRoutes from "./Controllers/profile.controller.js";
import connectDB from "./Utils/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { verifyToken } from "./Middleware/Token.middleware.js";

const app = express();
dotenv.config();
connectDB();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/service", serviceRoutes);

app.use("/project", projectRoutes);

app.use("/api", profileRoutes);

app.use("/transaction", transactionRoutes);
app.get("/check", verifyToken, (req, res) => {
  res.send("Hello World");
});
// Server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
