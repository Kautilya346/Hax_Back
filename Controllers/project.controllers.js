import express from "express";
import { Project } from "../Models/project.model.js";
import { verifyToken } from "../Middleware/Token.middleware.js";
import { User } from "../Models/user.model.js";

const router = express.Router();

router.get("/getprojectdetail/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("user2")
      .populate("Employer");

    return res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const employerId = req.user._id;
    const projects = await Project.find({ user1: employerId }).populate(
      "user2"
    );
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new project
router.post("/", verifyToken, async (req, res) => {
  try {
    const employerId = req.user._id;

    const { user2, price, description } = req.body;
    console.log(req.body);

    if (!user2 || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const employer = await User.findById(employerId);

    if (!employer) {
      // If the employer is not found, return an error message
      return res.status(404).json({ message: "Employer not found" });
    }

    // Step 2: Search for the freelancer (user2) in the User model by their ID
    const freelancer = await User.findById(user2);

    if (!freelancer) {
      // If the freelancer is not found, return an error message
      return res.status(404).json({ message: "Freelancer not found" });
    }
    console.log(employer, "employer");
    console.log(freelancer, "freelancer");
    const project = new Project({
      Employer: employer,
      user2: freelancer,
      price,
      description,
    });

    console.log(project);
    console.log("nahinahi");
    await project.save();
    console.log("hiihihihihi");
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/updatebool", async (req, res) => {
  try {
    console.log("ohhohhbhaii");
    const { projectId, isProjectDoneByEmployer, isProjectDoneByFreelancer } =
      req.body;

    // Validate request data
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update fields with new values if provided
    if (isProjectDoneByEmployer !== undefined) {
      project.isProjectDoneByEmployer = isProjectDoneByEmployer;
    }
    if (isProjectDoneByFreelancer !== undefined) {
      project.isProjectDoneByFreelancer = isProjectDoneByFreelancer;
    }

    // Save the updated project back to the database
    await project.save();
    console.log(project, "save ogaya");
    res.status(200).json({
      message: "Project updated successfully",
      project: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
