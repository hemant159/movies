const mongoose = require('mongoose');

const busStopMatchSchema = new mongoose.Schema({
  vehicle_id: { type: String, unique: true },
  timestamp: Number,
  route_id: String,
  trip_id: String,
  matched_stop_id: mongoose.Schema.Types.ObjectId,
  matched_stop_name: String
}, { collection: 'bus_stop_matches' });

// Index if needed for quick lookups by vehicle_id
busStopMatchSchema.index({ vehicle_id: 1 });

module.exports = mongoose.model('BusStopMatch', busStopMatchSchema);
