const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer'); 
const auth = require('../middleware/auth');
const logActivity = require('../utils/logActivity');

const CLIENT_ID = "198473426738-d0o59tf5mr4q7jpl4lgae0qh13mi7ilh.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);


const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your specific provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

//NEW ROUTE
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        await transporter.sendMail({
            from: process.env.EMAIL_USER, 
            to: email,
            subject: 'Made4UU - Your Verification Code',
            html: `<h2>Welcome to Made4UU!</h2><p>Your verification code is: <strong style="font-size:24px;">${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
});

//UPDATE ROUTE
router.post('/register', async (req, res) => {
    const { email, password, name, username, otp } = req.body;

    const storedData = otpStore.get(email);
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
        return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    const emailExist = await User.findOne({ email: email });
    if (emailExist) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        username: name || username, 
        email: email,
        password: hashedPassword,
        role: 'Customer' 
    });

    try {
        await user.save();
        otpStore.delete(email); 
        await logActivity(req, 'REGISTER', 'User', user._id);
        res.status(201).json({ message: 'User Created' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//LOGIN ROUTE
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    
    await logActivity(req, 'LOGIN', 'User', user._id);
    
    // Updated to send user data to frontend
    res.json({ 
        token, 
        role: user.role, 
        message: 'Logged In',
        user: {
            username: user.username,
            email: user.email,
            role: user.role,
            date: user.date || user.createdAt
        }
    });
});

//GOOGLE OAUTH ROUTE
router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID 
        });
        const { email, name } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                username: name,
                email: email,
                password: await bcrypt.hash(Math.random().toString(36), 10), 
                role: 'Customer'
            });
            await user.save();
        }

        const sessionToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        
        if (user._id) await logActivity(req, 'LOGIN', 'User', user._id, 'Google Login');
        
        res.json({ 
            token: sessionToken, 
            role: user.role,
            user: { 
                username: user.username || user.name, 
                email: user.email,
                role: user.role,
                date: user.date || user.createdAt 
            } 
        });
    } catch (err) {
        console.error("Google Auth Error:", err.message); 
        res.status(400).json({ message: "Google Auth Failed" });
    }
});

// GET PROFILE ROUTE
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select('-password');
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            date: user.date || user.createdAt
        });
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

// REQUEST EMAIL UPDATE OTP
router.post('/request-email-update', async (req, res) => {
    try {

        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
        jwt.verify(token, process.env.JWT_SECRET);

        const { newEmail } = req.body;
        if (!newEmail) return res.status(400).json({ message: "New email is required" });


        const emailExist = await User.findOne({ email: newEmail });
        if (emailExist) return res.status(400).json({ message: 'This email is already in use' });


        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(newEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });


        await transporter.sendMail({
            from: process.env.EMAIL_USER, 
            to: newEmail,
            subject: 'Made4UU - Verify your new email',
            html: `<h2>Email Update Request</h2><p>Your verification code is: <strong style="font-size:24px;">${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Update Email Error:", error);
        res.status(500).json({ message: "Failed to send verification email." });
    }
});


router.put('/verify-email-update', async (req, res) => {
    try {
    
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { newEmail, otp, username } = req.body;


        const storedData = otpStore.get(newEmail);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP code.' });
        }

        const user = await User.findById(decoded._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.email = newEmail;
        if (username) user.username = username;
        await user.save();

        otpStore.delete(newEmail);
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "Failed to update profile." });
    }
});

    // FORGOT PASSWORD: SEND OTP
router.post('/forgot-password-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "No account found with that email." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        await transporter.sendMail({
            from: process.env.EMAIL_USER, 
            to: email,
            subject: 'Made4UU - Password Reset Request',
            html: `<h2>Password Reset Request</h2><p>Your verification code to reset your password is: <strong style="font-size:24px;">${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Forgot Password Email Error:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
});
1
// RESET PASSWORD (VERIFY OTP & UPDATE)
router.put('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const storedData = otpStore.get(email);
        if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP code.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        otpStore.delete(email); 
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Failed to reset password." });
    }
});
module.exports = router;