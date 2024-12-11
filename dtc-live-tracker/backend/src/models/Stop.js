import mongoose from 'mongoose';

const StopSchema = new mongoose.Schema({
  stop_code: String,
  stop_id: String,
  stop_lat: Number,
  stop_lon: Number,
  stop_name: String,
  zone_id: String,
});

export default mongoose.model('Stop', StopSchema);
