import { Router } from "express";
import { verifyToken } from "../Middleware/Token.middleware.js";
import { Project } from "../Models/project.model.js";

const router = Router();

const getCurrentUser = (req) => {
  return req.user || null;
};

router.get("/profile", verifyToken, async (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }

  try {
    const userProjects = await Project.find({
      $or: [{ Employer: user._id }, { user2: user._id }],
    })
      .populate("Employer")
      .populate("user2");

    //console.log(user, "Authenticated user.");
    console.log(userProjects, "Projects where user is involved.");

    res.json({ user, projects: userProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
