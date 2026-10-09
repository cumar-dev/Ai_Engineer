import mongoose from "mongoose";
const mongoDB_URL = process.env.MONGODB_URL;
if(!mongoDB_URL) {
    console.log(`mongoDb url is not get yet: ${mongoDB_URL}`)
}
export async function connectDB() {
    try {
        await mongoose.connect(mongoDB_URL as string);
        console.log("mongodb connected successfully...");
    } catch (error) {
        console.error("mongodb connection failed");
        throw new Error("mongodb connection failed");
    }
}