const mongoose = require("mongoose");
const Crew = require("./models/Crew");

mongoose.connect("mongodb://127.0.0.1:27017/dtc_scheduling", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, 
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

/**
 * Get the current date and time in IST as a formatted string
 * @returns {string} - Current date and time in IST
 */
const getISTDate = () => {
  const now = new Date();
  return now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

/**
 * Generate shift start and end times based on the shift
 * @param {string} shift - morning, afternoon, or evening
 * @returns {Object} - shiftStartTime and shiftEndTime in IST format
 */
const getShiftTimes = (shift) => {
  const today = new Date();
  const shiftStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (shift === "morning") {
    shiftStartTime.setHours(6, 0, 0, 0);
    const shiftEndTime = new Date(shiftStartTime);
    shiftEndTime.setHours(12, 0, 0, 0);
    return {
      shiftStartTime: shiftStartTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      shiftEndTime: shiftEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
  }

  if (shift === "afternoon") {
    shiftStartTime.setHours(12, 0, 0, 0);
    const shiftEndTime = new Date(shiftStartTime);
    shiftEndTime.setHours(18, 0, 0, 0);
    return {
      shiftStartTime: shiftStartTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      shiftEndTime: shiftEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
  }

  if (shift === "evening") {
    shiftStartTime.setHours(18, 0, 0, 0);
    const shiftEndTime = new Date(shiftStartTime);
    shiftEndTime.setHours(23, 59, 59, 999);
    return {
      shiftStartTime: shiftStartTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      shiftEndTime: shiftEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
  }

  throw new Error(`Invalid shift: ${shift}`);
};

/**
 * Generate crew data for 3000 crew members
 * @param {number} count - The number of crew members to generate
 * @returns {Array} - Array of crew objects
 */
const generateCrewData = (count) => {
  const shifts = ["morning", "afternoon", "evening"];
  const crew = [];
  for (let i = 1; i <= count; i++) {
    const shift = shifts[(i - 1) % shifts.length];
    const { shiftStartTime, shiftEndTime } = getShiftTimes(shift);
    crew.push({
      name: `Crew Member ${i}`,
      shift: shift,
      tempShift: null,
      tempShiftDate: null,
      status: "active",
      assignedBus: null,
      lastAssignedBus: null,
      restUntil: null,
      shiftStartTime: shiftStartTime,
      shiftEndTime: shiftEndTime,
      currentShiftStartDate: getISTDate()
    });
  }
  return crew;
};

/**
 * Seed the Crew collection
 */
const seedCrew = async () => {
  try {
    const crewCount = 6000;
    const batchSize = 500;
    const crewData = generateCrewData(crewCount);
    console.log(`Starting to seed ${crewCount} crew members...`);

    for (let i = 0; i < crewData.length; i += batchSize) {
      const batch = crewData.slice(i, i + batchSize);
      await Crew.insertMany(batch, { ordered: false });
      console.log(`Inserted ${i + batch.length} crew members so far`);
    }

    console.log("Successfully seeded all crew members.");
  } catch (err) {
    console.error("Error seeding crew data:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedCrew();
