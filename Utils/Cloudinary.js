import { v2 as cloundinary } from "cloudinary";
import fs from "fs";

cloundinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCLoudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    console.log("biiii");
    console.log("Cloudinary config:", {
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    const response = await cloundinary.uploader.upload(localFilePath);

    console.log("hiiiiiiiiiiii");
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCLoudinary };
