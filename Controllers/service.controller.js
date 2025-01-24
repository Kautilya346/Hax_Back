import express from "express";
import { uploadOnMulter } from "../Middleware/multer.middleware.js";
import { verifyToken } from "../Middleware/Token.middleware.js";
import { Service } from "../Models/service.model.js";
import { uploadOnCLoudinary } from "../Utils/Cloudinary.js";

const router = express.Router();

// POST route to create a new service
router.post(
  "/user",
  verifyToken,
  uploadOnMulter.single("image"),
  async (req, res) => {
    try {
      const { title, price, description } = req.body;
      console.log(req.body);

      if (!title || !price || !description || !req.file) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const localPostImage = req.file?.path;

      const cloudianryPath = await uploadOnCLoudinary(localPostImage);

      const newService = new Service({
        title,
        user: req.user._id,
        price,
        image: cloudianryPath,
        description,
      });

      await newService.save();
      res
        .status(201)
        .json({ message: "Service created successfully", service: newService });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
      console.log("rerror hai");
    }
  }
);

export default router;
