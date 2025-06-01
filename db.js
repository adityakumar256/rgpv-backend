const mongoose = require("mongoose");

const url = "mongodb+srv://aditya44587:aditya123@cluster0.5jtlthg.mongodb.net/myDatabase?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" Database connected successfully");
  } catch (err) {
    console.error(" Database connection failed:", err.message);
  }
};

module.exports = connectDB;

