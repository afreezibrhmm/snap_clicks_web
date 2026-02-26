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
then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    eventType: String,
    date: String,
    message: String
});

const Booking = mongoose.model("Booking", bookingSchema);

// API Routes

// Create Booking
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
app.get("/bookings", async (req, res) => {
    const bookings = await Booking.find();
    res.json(bookings);
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});