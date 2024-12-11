const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cron = require("node-cron");
const Crew = require("./models/Crew");

// Import routes
const crewRoutes = require("./routes/crewRoutes");

const { updateShiftStatuses, checkForNewBuses } = require("./controllers/crewController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/crew", crewRoutes);

// Shift Rotation Cron Job
cron.schedule("0 0 * * 1", async () => { // Runs every Monday at midnight
  console.log("Rotating shifts for the week...");
  const shiftRotation = {
    morning: "afternoon",
    afternoon: "evening",
    evening: "morning",
  };

  try {
    const crews = await Crew.find();
    for (const crew of crews) {
      crew.shift = shiftRotation[crew.shift]; // Rotate shifts
      await crew.save();
    }
    console.log("Shift rotation completed successfully.");
  } catch (err) {
    console.error("Error rotating shifts:", err);
  }
});

cron.schedule("*/5 * * * * *", async () => {
  try {
    console.log("Running shift status updater...");
    await updateShiftStatuses();
    await checkForNewBuses();
    console.log("RUNNING");
  } catch (error) {
    console.error('Error in the cron job:', error);
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));