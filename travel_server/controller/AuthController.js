import bcrypt from 'bcryptjs';
import User from "../models/user_model.js";
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

// Helper function to geocode Nepali addresses
async function geocodeNepaliAddress(address) {
    try {
        // Add delay to respect OpenStreetMap's rate limit (1 request per second)
        await setTimeout(1000);
        
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}, Nepal&format=json&countrycodes=np`
        );
        
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

export const Register = async (req, res) => {
    try {
        const { name, address, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: "User already registered"
            });
        }

        // Geocode the Nepali address
        const coordinates = await geocodeNepaliAddress(address);
        
        // Create user with address data
        const newUser = new User({
            name,
            email,
            password: bcrypt.hashSync(password),
            address: {
                text: address,  // Original Nepali address
                coordinates: coordinates || undefined
            }
        });

        await newUser.save();

        // Return response without password
        const userData = newUser.toObject();
        delete userData.password;

        res.status(201).json({
            status: true,
            message: "Registration successful",
            data: userData
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            status: false,
            message: "Registration failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login remains exactly the same
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).lean().exec();

        if (!user) {
            return res.status(403).json({
                status: false,
                message: "Invalid login credentials"
            });
        }
            
        // Check password 
        const isVerifyPassword = await bcrypt.compare(password, user.password);
        if (!isVerifyPassword) {
            return res.status(403).json({
                status: false,
                message: "Invalid login credentials"
            });
        }

        delete user.password;

        // Create token
        const token = jwt.sign(user, process.env.JWT_SECRET);

        res.cookie('access_token', token, {
            httpOnly: true
        });
        
        res.status(200).json({
            status: true,
            message: "Login success"
        });

    } catch (error) {
        res.status(500).json({
            status: false, 
            error: error.message
        });
    }
};