const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  route_id: String,
  service_id: String,
  trip_id: String
}, { collection: 'trips' });

tripSchema.index({ trip_id: 1, route_id: 1 });

module.exports = mongoose.model('Trip', tripSchema);
