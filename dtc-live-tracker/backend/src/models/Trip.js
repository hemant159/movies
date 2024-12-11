import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  route_id: String,
  service_id: String,
  trip_id: String,
  shape_id: String,
});

export default mongoose.model('Trip', TripSchema);
