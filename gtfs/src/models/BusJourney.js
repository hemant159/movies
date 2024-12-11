const mongoose = require('mongoose');

const busJourneySchema = new mongoose.Schema({
  vehicle_id: String,
  route_id: String,
  trip_id: String,
  first_stop: String,
  last_stop: String,
  intermediate_stops: [String]
}, { collection: 'bus_journey' });

busJourneySchema.index({ vehicle_id: 1, trip_id: 1 });

module.exports = mongoose.model('BusJourney', busJourneySchema);
