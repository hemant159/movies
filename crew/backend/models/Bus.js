const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  tripId: { type: String, required: true },
});

module.exports = mongoose.model("Bus", BusSchema);
