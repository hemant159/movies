import mongoose from 'mongoose';

const StopTimeSchema = new mongoose.Schema({
  trip_id: String,
  arrival_time: String,
  departure_time: String,
  stop_id: String,
  stop_sequence: Number,
});

export default mongoose.model('StopTime', StopTimeSchema);
