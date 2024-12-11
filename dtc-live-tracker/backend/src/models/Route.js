import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema({
  agency_id: String,
  route_id: String,
  route_long_name: String,
  route_short_name: String,
  route_type: String,
  shape: {
    type: { type: String, default: 'LineString' },
    coordinates: [[Number]],
  },
});

RouteSchema.index({ shape: '2dsphere' }); // Geospatial index

export default mongoose.model('Route', RouteSchema);
