import mongoose from "mongoose";

export default async function connectDB(){
    try{
        await mongoose.connect(`${process.env.DB_URI}`)
        console.log('DB Connected Successfully');
    } catch (error) {
        console.log('MongoDB connection failed',error);
        process.exit(1);
    }
}