import {generateTokenAndSetCookie} from '../lib/utils/generateToken.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password, phone } = req.body;

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
            phone
        });

        if(password.length < 6){
            return res.status(400).json({error: "Password must be at least 6 characters long"});
        }

        if(newUser){
            await newUser.save();

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please login.',
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        }else{
            res.status(400).json({
                success: false,
                message: 'Invalid User data'
            });
        }
    } catch (error) {
        console.error("error in signup controller", error.message);
        res.status(500).json({
            success: false,
            message: 'Error in registration',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token and set cookie
        generateTokenAndSetCookie(user._id, user.role, res);

        // Send response
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            address: user.address,
            phone: user.phone,
            profileImg: user.profileImg,
            isActive: user.isActive,
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15d' })
        });
    } catch (error) {
        console.error("error in login controller", error.message);
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0),
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.cookie("role", "", {
            httpOnly: false,
            expires: new Date(0),
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error in logout',
            error: error.message
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user); 
    }catch(error){
        console.error("error in getMe controller", error.message);
        res.status(500).json({error: "internal server error"});
    } 
}


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User with this email does not exist" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL with token
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Hello ${user.fullName}</h2>
                <p>You requested a password reset for your Pharmacy account.</p>
                <p>Click the button below to set a new password:</p>
                <a href="${resetUrl}" 
                   style="background-color: #4CAF50; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 4px; 
                          display: inline-block;
                          margin: 16px 0;">
                    Reset Password
                </a>
                
                <p style="color: #ff0000;"><strong>This link will expire in 10 minutes.</strong></p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">If you didn't request this reset, please ignore this email.</p>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Reset Your Password - Pharmacy Website',
            html: message
        });

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        });

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ error: "Failed to send reset email. Please try again later." });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: "Please provide both reset token and new password" });
        }

        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Set new password and clear reset token
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // Send confirmation email
        const message = `
            <h2>Hello ${user.fullName}</h2>
            <p>Your password has been successfully reset.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset Successful',
            html: message
        });

        res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login with your new password."
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ error: "Failed to reset password. Please try again." });
    }
};