const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 3000;


// ================= MIDDLEWARE =================

app.use(
    express.json({
        limit: "50mb"
    })
);

app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true
    })
);

app.use(
    cors({
        origin: "*"
    })
);


// ================= CONFIG =================

const SECRET = "secret123";

// Fixed with your exact correct working Python AI service URL on Render (-a64m included)
const AI_SERVER = process.env.AI_SERVER || "https://emotions-detector-backend-a64m.onrender.com";



// ================= TEMP DATABASE =================

const users = [];



// ================= HOME =================

app.get("/", (req, res) => {
    res.json({
        message: "Emotion Detector Node.js Backend is Running 🚀",
        ai_server: AI_SERVER
    });
});



// ================= REGISTER =================

app.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        users.push({
            name,
            email,
            password: hashedPassword
        });

        console.log("✅ New User:", email);

        res.json({
            message: "Register success"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



// ================= LOGIN =================

app.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = users.find(
            u => u.email === email
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const check = await bcrypt.compare(
            password,
            user.password
        );

        if (!check) {
            return res.status(401).json({
                message: "Wrong password"
            });
        }

        const token = jwt.sign(
            {
                email: user.email,
                name: user.name
            },
            SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login success",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



// ================= EMOTION AI =================

app.post(
    "/detect-emotion",
    async (req, res) => {
        try {
            const { image } = req.body;

            if (!image) {
                return res.status(400).json({
                    success: false,
                    emotion: "No image"
                });
            }

            console.log("📸 Image received, forwarding to Python AI server...");

            const response = await axios.post(
                `${AI_SERVER}/detect-emotion`,
                { image },
                { timeout: 60000 } // 60 seconds timeout for Render cold-starts
            );

            console.log("🤖 AI Response:", response.data);

            res.json({
                success: true,
                emotion: response.data.emotion
            });

        } catch (error) {
            if (error.response) {
                console.log("❌ AI SERVER ERROR DATA:", error.response.data);
            } else {
                console.log("❌ AI ERROR:", error.message);
            }

            res.status(500).json({
                success: false,
                emotion: "SERVER ERROR",
                details: error.response ? error.response.data : error.message
            });
        }
    }
);



// ================= PROTECTED TEST =================

app.get("/profile", (req, res) => {
    res.json({
        message: "Profile API working"
    });
});



// ================= 404 =================

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});



// ================= START =================

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `🚀 Backend running on http://localhost:${PORT}`
        );
        console.log(
            `🧠 AI Server: ${AI_SERVER}`
        );
    }
);
