require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ⭐ Serve frontend files
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: {
        type: String,
        default: "admin"
    }
});

const Admin = mongoose.model("Admin", adminSchema);
const bookingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    eventType: String,
    date: String,
    message: String
});

const Booking = mongoose.model("Booking", bookingSchema);

// API Routes
app.post("/admin/register", async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
        email,
        password: hashedPassword
    });
app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({ token });
});
    await admin.save();
    res.json({ message: "Admin Created" });
});
// Create Booking
function verifyAdmin(req, res, next) {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
}

app.post("/book", async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Booking Saved Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Bookings (Admin)
app.get("/bookings", verifyAdmin, async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
