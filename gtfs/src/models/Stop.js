const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stop_code: String,
  stop_id: String, // Ensure same type as used in stop_times (convert if needed)
  stop_lat: String,
  stop_lon: String,
  stop_name: String,
  zone_id: String
}, { collection: 'stops' });

stopSchema.index({ stop_id: 1 });

module.exports = mongoose.model('Stop', stopSchema);
