const express = require("express");
const { listCrew, assignCrew, completeTrip, transferBus, swapShift  } = require("../controllers/crewController");

const router = express.Router();

router.get('/list', listCrew);
// Assign crew to buses
router.get("/assign", assignCrew);

// Complete a trip
router.post("/complete_trip", completeTrip);

// Transfer a bus
router.post("/transfer_bus", transferBus);

// **POST** - Swap crew shifts for a specific date
router.post('/swap_shift', swapShift);

module.exports = router;