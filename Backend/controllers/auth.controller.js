const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); // Make sure this path points to your actual database model


require('dotenv').config();
// Temporary memory to store the 6-digit codes
const otpStore = new Map();

// Email Sender Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  },
  tls: {
    rejectUnauthorized: false // <--- THIS IS THE FIX FOR MAC USERS
  }
});

// --- 1. SEND OTP FUNCTION ---
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store it so we can verify it later (Expires in 10 minutes)
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Made4UU - Your Verification Code',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Welcome to Made4UU!</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 40px; letter-spacing: 5px; color: #4f46e5;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send email. Check backend console." });
  }
};

// --- 2. REGISTER FUNCTION (WITH OTP CHECK) ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // Verify OTP First
    const storedData = otpStore.get(email);
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP code." });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists with this email." });

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to database
    user = new User({
      name: name,
      username: name, // Saving as both just to be safe for your Profile page
      email: email,
      password: hashedPassword
    });

    await user.save();
    
    // Delete OTP from memory so it can't be reused
    otpStore.delete(email);

    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// --- 3. STANDARD LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create the token that your frontend localStorage uses
    const token = jwt.sign(
      { userId: user._id, role: user.role || 'Customer' }, 
      process.env.JWT_SECRET || 'your_secret_key', 
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: "Logged in successfully",
      token: token,
      role: user.role || 'Customer',
      user: { name: user.name, email: user.email } // ADD THIS LINE
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};