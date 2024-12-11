const mongoose = require('mongoose');

const stopTimeSchema = new mongoose.Schema({
  trip_id: String,
  arrival_time: String,
  departure_time: String,
  stop_id: String, // Or String depending on your DB. Adjust accordingly.
  stop_sequence: String
}, { collection: 'stop_times' });

stopTimeSchema.index({ trip_id: 1, stop_sequence: 1 });

module.exports = mongoose.model('StopTime', stopTimeSchema);
