require('dotenv').config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

// SIGNUP CONTROLLER
const signup = async (req, res) => {
  const { name, email, password, college } = req.body;

  try {    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword, college });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      secretKey,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        college: newUser.college,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// LOGIN CONTROLLER
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, name: existingUser.name },
      secretKey,
      { expiresIn: '1h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email,
        college: existingUser.college,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = {
  signup,
  login,
};
