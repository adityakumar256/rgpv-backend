const mongoose = require("mongoose");
const url = process.env.MONGO_URI; 


const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,g
    });
    console.log(" Database connected successfully");
  } catch (err) {
    console.error(" Database connection failed:", err.message);
  }
};

module.exports = connectDB;

