import express from "express";
import { uploadOnMulter } from "../Middleware/multer.middleware.js";
import { verifyToken } from "../Middleware/Token.middleware.js";
import { Service } from "../Models/service.model.js";
import { uploadOnCLoudinary } from "../Utils/Cloudinary.js";

const router = express.Router();

// GET route to fetch all services
router.get("/users", async (req, res) => {
  try {
    const services = await Service.find().populate("user");
    res.status(200).json({ services });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
});

// POST route to create a new service
router.post(
  "/user",
  verifyToken,
  uploadOnMulter.single("image"),
  async (req, res) => {
    try {
      const { title, price, description, domain, contact } = req.body;
      console.log(req.body);

      if (
        !title ||
        !price ||
        !description ||
        !req.file ||
        !domain ||
        !contact
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const localPostImage = req.file?.path;
      console.log(localPostImage);

      const cloudianryPath = await uploadOnCLoudinary(localPostImage);

      const newService = new Service({
        title,
        user: req.user._id,
        price,
        description,
        domain,
        contact,
        image: cloudianryPath.url,
      });

      await newService.save();
      res
        .status(201)
        .json({ message: "Service created successfully", service: newService });
    } catch (error) {
      //console.log(error);
      res.status(500).json({ message: "Server error", error: error });
    }
  }
);

export default router;