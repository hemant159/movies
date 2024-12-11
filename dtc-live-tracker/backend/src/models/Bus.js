import mongoose from 'mongoose';

const BusSchema = new mongoose.Schema({
  vehicle_id: { type: String, required: true, unique: true },
  trip_id: { type: String, required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: "Route" }, // Reference Route
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  next_stop: { type: mongoose.Schema.Types.ObjectId, ref: "Stop" },
  directions: { type: String }, // Encoded polyline
  timestamp: { type: Number, required: true },
}, { collection: 'live_buses' });

export default mongoose.model('Bus', BusSchema);