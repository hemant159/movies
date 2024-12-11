const cron = require("node-cron");
const Crew = require("../models/Crew");
const { rotateShiftForNextWeek } = require("../utils/shiftUtils");
const { updateShiftStatuses } = require("./controllers/crewController");

// Run every hour to update shift statuses
// cron.schedule("*/5 * * * * *", async () => {
//     console.log("Running shift status updater...");
//     await updateShiftStatuses();
//   });
  

cron.schedule("0 0 * * 1", async () => {
  try {
    console.log("Rotating weekly shifts...");
    const crews = await Crew.find();
    for (const crew of crews) {
      crew.shift = crew.nextWeekShift || rotateShiftForNextWeek(crew.shift);
      crew.nextWeekShift = rotateShiftForNextWeek(crew.shift);
      crew.currentShiftStartDate = new Date();
      await crew.save();
    }
    console.log("Weekly shift rotation complete.");
  } catch (err) {
    console.error("Error rotating shifts:", err);
  }
});


// Reset tempShift and tempShiftDate every day at midnight
cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Resetting temporary shifts...");
      await Crew.updateMany(
        { tempShift: { $ne: null } }, // Only reset crews with temp shifts
        { tempShift: null, tempShiftDate: null } // Clear tempShift and tempShiftDate
      );
      console.log("Temporary shifts reset successfully.");
    } catch (err) {
      console.error("Error resetting temporary shifts:", err);
    }
  });