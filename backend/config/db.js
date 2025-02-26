import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("your-mongodb-connection-string", {
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
