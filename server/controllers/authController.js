const bcrypt = require("bcrypt");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { access_token } = req.body;

        if (!access_token) {
            return res.status(400).json({
                message: "Google access token is required"
            });
        }

        const {
            data: { user },
            error
        } = await supabase.auth.getUser(access_token);

        if (error || !user) {
            return res.status(401).json({
                message: "Invalid Google authentication"
            });
        }

        const email = user.email;
        const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            email.split("@")[0];

        // Check if VaultDrive user already exists
        let result = await db.query(
            "SELECT id, name, email FROM users WHERE email = $1",
            [email]
        );

        let vaultUser;

        if (result.rows.length === 0) {
            // Create a new VaultDrive user for the Google account
            result = await db.query(
                `INSERT INTO users (name, email, password)
                 VALUES ($1, $2, NULL)
                 RETURNING id, name, email`,
                [name, email]
            );

            vaultUser = result.rows[0];
        } else {
            vaultUser = result.rows[0];
        }

        // Issue the same JWT used by normal email/password login
        const token = jwt.sign(
            {
                userId: vaultUser.id,
                email: vaultUser.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                id: vaultUser.id,
                name: vaultUser.name,
                email: vaultUser.email
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        return res.status(500).json({
            message: "Google login failed"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin
};