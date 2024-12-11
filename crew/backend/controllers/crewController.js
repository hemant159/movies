const mongoose = require("mongoose");
const Crew = require("../models/Crew");
const { isShiftActiveOrStartingSoon, getISTDate } = require('../utils/shiftUtils');

// Define the Bus model dynamically for live_buses collection
const Bus = mongoose.model(
  "Bus",
  new mongoose.Schema({
    vehicle_id: String,
    latitude: Number,
    longitude: Number,
    trip_id: String,
  }),
  "live_buses" // Specify the collection name
);

let previousBusCount = 0;

// Get the current shift based on the current IST time
const getCurrentShift = () => {
    const now = new Date();
    const hoursIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }).split(', ')[1].split(':')[0];
    const currentHour = parseInt(hoursIST, 10);
  
    if (currentHour >= 6 && currentHour < 12) {
      return "morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "afternoon";
    } else if (currentHour >= 18 && currentHour < 24) {
      return "evening";
    } else {
      return null; // If it's after midnight, don't change shift (or you can add a night shift if needed)
    }
  };

  // Calculate shift end time
const calculateShiftEndTime = (shift) => {
  const now = new Date();
  let endTime;
  if (shift === "morning") {
    endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // 12:00 PM
  } else if (shift === "afternoon") {
    endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0); // 6:00 PM
  } else if (shift === "evening") {
    endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); // 11:59 PM
  }
  return endTime;
};

// Assign crew to buses
const assignCrew = async (req, res) => {
  try {
    const now = getISTDate();

    const buses = await Bus.find();
    if (!buses.length) {
      return res.status(400).json({ message: "No live buses available for assignment." });
    }

    const crew = await Crew.find({
      status: "active",
      assignedBus: null,
      $or: [
        { restUntil: null }, 
        { restUntil: { $lte: now } } 
      ],
    });

    if (!crew.length) {
      return res.status(400).json({ message: "No available crew. Please add crew members." });
    }

    let assignments = {}; 

    for (const bus of buses) {
      const availableCrew = crew.shift(); 
      if (!availableCrew) break; 

      availableCrew.assignedBus = bus._id; 
      availableCrew.assignedBusVehicleId = bus.vehicle_id;
      availableCrew.status = "assigned"; 
      assignments[bus.vehicle_id] = availableCrew.name; 
      await availableCrew.save(); 
    }

    res.json({ assignments });
  } catch (err) {
    console.error("Error in assigning crew:", err);
    res.status(500).json({ message: "Error assigning crew" });
  }
};

const checkForNewBuses = async () => {
  try {
    const currentShift = getCurrentShift();
    if (!currentShift) {
      console.log("No active shift currently.");
      return;
    }

    // Get total number of buses
    const busCount = await Bus.countDocuments();
    if (busCount > previousBusCount) {
      const newBusCount = busCount - previousBusCount;
      console.log(`New buses detected: ${newBusCount} new buses have been added.`);
      
      const newBuses = await Bus.find().sort({ _id: -1 }).limit(newBusCount);
      const availableCrews = await Crew.find({
        shift: currentShift, 
        status: "active", 
        assignedBus: null 
      });

      for (let i = 0; i < newBuses.length; i++) {
        const bus = newBuses[i];
        const crew = availableCrews[i];

        if (!crew) break; // No crew available

        // Calculate remaining time for the crew's shift
        const now = new Date();
        const shiftEndTime = calculateShiftEndTime(crew.shift);
        const timeLeftInShift = (shiftEndTime - now) / (1000 * 60); // Time in minutes

        // If the crew has less than 30 minutes left in their shift, do not assign them a bus
        if (timeLeftInShift < 30) {
          console.log(`Crew ${crew.name} has only ${Math.round(timeLeftInShift)} mins left in shift. Skipping assignment.`);
          continue;
        }

        crew.assignedBus = bus._id;
        crew.assignedBusVehicleId = bus.vehicle_id;
        crew.status = 'assigned';
        await crew.save();
        console.log(`Assigned bus ${bus.vehicle_id} to Crew ${crew.name}`);
      }

      previousBusCount = busCount;
    } else {
      console.log("No new buses detected.");
    }
  } catch (error) {
    console.error('Error checking for new buses:', error);
  }
};

// Update crew shift status and bus assignments
const updateShiftStatuses = async () => {
    try {
      const currentShift = getCurrentShift();
  
      if (!currentShift) {
        console.log("No current shift active.");
        return;
      }
  
      console.log(`Updating shift statuses. Current shift: ${currentShift}`);
  
      // 1. Free all crews that are NOT part of the current shift
      await Crew.updateMany(
        { shift: { $ne: currentShift } }, 
        { 
          assignedBus: null,
          assignedBusVehicleId: null, 
          status: 'active', 
          restUntil: null 
        }
      );
      console.log(`All crews NOT in the ${currentShift} shift have been released.`);
  
      // 2. Reassign buses to crews currently in the active shift (only if they don't have a bus)
      const crewsInShift = await Crew.find({ shift: currentShift, assignedBus: null, status: 'active' });
      const Bus = mongoose.model('Bus', new mongoose.Schema({}, { strict: false }), 'live_buses');
      const availableBuses = await Bus.find().limit(crewsInShift.length);
  
      for (let i = 0; i < crewsInShift.length; i++) {
        const crew = crewsInShift[i];
        const bus = availableBuses[i];
        if (crew && bus) {
          crew.assignedBus = bus._id;
          crew.status = 'assigned';
          await crew.save();
        }
      }
  
      console.log(`${crewsInShift.length} crews in the ${currentShift} shift have been assigned buses.`);
    } catch (error) {
      console.error('Error updating shift statuses:', error);
    }
  };

// Complete a trip
const completeTrip = async (req, res) => {
  const { crewId, busId } = req.body;

  try {
    const crew = await Crew.findById(crewId);

    if (!crew || crew.assignedBus?.toString() !== busId) {
      return res.status(400).json({ message: "Invalid crew or bus assignment." });
    }

    const restEndTime = new Date(Date.now() + 30 * 60 * 1000); 
    const restUntil = restEndTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    crew.status = "resting"; 
    crew.restUntil = restUntil; 
    await crew.save();

    res.json({ 
      message: `Trip completed. Crew ${crew.name} is now resting until ${restUntil} IST.` 
    });
  } catch (err) {
    console.error("Error in completing trip:", err);
    res.status(500).json({ message: "Error completing trip" });
  }
};

// Transfer a bus from one crew to another
const transferBus = async (req, res) => {
  const { fromCrewId, toCrewId } = req.body;

  try {
    const fromCrew = await Crew.findById(fromCrewId);
    const toCrew = await Crew.findById(toCrewId);

    if (!fromCrew || !toCrew) {
      return res.status(404).json({ message: "One or both crew members not found." });
    }

    const busId = fromCrew.assignedBus; 
    if (!busId) {
      return res.status(400).json({ message: "From Crew has no bus to transfer." });
    }

    const now = getISTDate();
    if (toCrew.restUntil && new Date(toCrew.restUntil) > new Date(now)) {
      return res.status(400).json({ message: `To Crew is still resting.` });
    }

    if (toCrew.assignedBus) {
      return res.status(400).json({ message: "To Crew already has a bus assigned." });
    }

    if (!isShiftActiveOrStartingSoon(toCrew.shift)) {
      return res.status(400).json({ message: `To Crew's shift is not active or about to start.` });
    }

    // Step 1: Transfer bus to toCrew
    toCrew.assignedBus = busId;
    toCrew.assignedBusVehicleId = bus.vehicle_id;
    toCrew.status = "assigned";
    await toCrew.save();

    // Step 2: Set fromCrew to resting after successful transfer
    fromCrew.status = "resting";
    fromCrew.assignedBus = null;
    fromCrew.assignedBusVehicleId = null; 
    fromCrew.restUntil = new Date(Date.now() + 30 * 60 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    await fromCrew.save();

    res.json({ message: `Bus transferred successfully from ${fromCrew.name} to ${toCrew.name}.` });
  } catch (err) {
    console.error("Error in transferring bus:", err);
    res.status(500).json({ message: "Error transferring bus" });
  }
};

// Swap a crew member's shift for a specific day
// Swap a crew member's shift for a specific day and swap buses
const swapShift = async (req, res) => {
    const { crewId, newShift, date } = req.body;
  
    try {
      // Step 1: Validate Crew 1 (The one requesting shift change)
      const crew1 = await Crew.findById(crewId);
      if (!crew1) {
        return res.status(404).json({ message: "Crew member not found." });
      }
  
      if (crew1.shift === newShift) {
        return res.status(400).json({ message: "You are already on this shift." });
      }
  
      // Step 2: Find Crew 2 (A crew member who will take over Crew 1's shift)
      const crew2 = await Crew.findOne({
        shift: newShift, 
        status: "active", 
        restUntil: null // Remove the assignedBus condition
      });
  
      if (!crew2) {
        return res.status(400).json({ message: "No eligible crew members found to fill the vacant shift." });
      }
  
      // Step 3: Get the buses assigned to Crew 1 and Crew 2
      const busFromCrew1 = crew1.assignedBus; // This is the bus assigned to Crew 1
      const busFromCrew2 = crew2.assignedBus; // This is the bus assigned to Crew 2
  
      // Step 4: Swap the assigned buses between Crew 1 and Crew 2
      crew1.assignedBus = busFromCrew2; // Crew 1 gets Crew 2's bus
      crew1.assignedBusVehicleId = busFromCrew2 ? (await Bus.findById(busFromCrew2)).vehicle_id : null;

      crew2.assignedBus = busFromCrew1; // Crew 2 gets Crew 1's bus
      crew2.assignedBusVehicleId = busFromCrew1 ? (await Bus.findById(busFromCrew1)).vehicle_id : null;
  
      // Step 5: Update shift details for Crew 1 and Crew 2
      crew1.tempShift = newShift; 
      crew1.tempShiftDate = date; 
      await crew1.save();
  
      crew2.tempShift = crew1.shift; 
      crew2.tempShiftDate = date; 
      await crew2.save();
  
      res.json({
        message: `Shift swap successful. 
        ${crew1.name} will work the ${newShift} shift and has taken over the bus previously assigned to ${crew2.name}. 
        ${crew2.name} has taken over the ${crew1.shift} shift and now has the bus previously assigned to ${crew1.name}.`
      });
    } catch (err) {
      console.error("Error in swapping shift:", err);
      res.status(500).json({ message: "Error swapping shift" });
    }
  };

// Get Crew List
const listCrew = async (req, res) => {
  try {
    const crews = await Crew.find();
    res.status(200).json(crews);
  } catch (err) {
    console.error('Error fetching crew list:', err);
    res.status(500).json({ message: 'Error fetching crew list' });
  }
};

module.exports = { assignCrew, completeTrip, transferBus, swapShift, updateShiftStatuses, checkForNewBuses,listCrew };
