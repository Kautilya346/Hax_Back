import { User } from "../Models/user.model.js";
import jwt from "jsonwebtoken";

export async function verifyToken(req, res, next) {
  try {
    // console.log(req.cookies, "hello");
    const currAccessToken = await req.cookies?.accessToken;
    // console.log(currAccessToken, "currr access  sdsds");
    if (!currAccessToken) {
      return res.status(406).json({
        errCode: 406,
        message: "User is not logged-in",
      });
    }

    const dataFromToken = jwt.verify(
      currAccessToken,
      process.env.A_SECRET_TOKEN
    );

    const userFromToken = await User.findById(dataFromToken?._id).select(
      "-password -refreshToken"
    );

    if (!userFromToken) {
      return res.json({
        message: "Access token is fake",
      });
    }
    req.user = userFromToken;

    next();
  } catch (error) {
    console.log(error);
  }
}
