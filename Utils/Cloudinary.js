import { v2 as cloundinary } from "cloudinary";
import fs from "fs";

const uploadOnCLoudinary = async (localFilePath) => {
  try {
    cloundinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    if (!localFilePath) {
      return null;
    }
    const response = await cloundinary.uploader.upload(localFilePath);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCLoudinary };
