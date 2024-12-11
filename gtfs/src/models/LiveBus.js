const mongoose = require('mongoose');

const liveBusSchema = new mongoose.Schema({
  vehicle_id: String,
  latitude: Number,
  longitude: Number,
  timestamp: Number,
  trip_id: String,
  route_id: String, // Might need conversion to number
  bearing: Number,
  label: String,
  license_plate: String,
  occupancy_status: Number,
  schedule_relationship: Number,
  speed: Number,
  stop_id: String
}, { collection: 'live_buses' });

liveBusSchema.index({ vehicle_id: 1 });

module.exports = mongoose.model('LiveBus', liveBusSchema);
