const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  agency_id: String,
  route_id: String, // Ensure route_id stored as a number if that's how it's in DB
  route_long_name: String,
  route_type: String
}, { collection: 'routes' });

routeSchema.index({ route_id: 1 });

module.exports = mongoose.model('Route', routeSchema);
