import express from "express";
import { uploadOnMulter } from "../Middleware/multer.middleware.js";

import { Service } from "../Models/service.model.js";

const router = express.Router();

// POST route to create a new service
router.post("/user", uploadOnMulter.single("image"), async (req, res) => {
  try {
    const { title, user, price, description } = req.body;

    if (!title || !user || !price || !description || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imageUrl = `/temp/${req.file.filename}`;

    const newService = new Service({
      title,
      user,
      price,
      image: imageUrl,
      description,
    });

    await newService.save();
    res
      .status(201)
      .json({ message: "Service created successfully", service: newService });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
