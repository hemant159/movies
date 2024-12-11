import mongoose from 'mongoose';

const FareRuleSchema = new mongoose.Schema({
  fare_id: String,
  route_id: String,
  origin_id: String,
  destination_id: String,
});

export default mongoose.model('FareRule', FareRuleSchema);
