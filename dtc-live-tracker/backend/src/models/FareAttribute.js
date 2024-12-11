import mongoose from 'mongoose';

const FareAttributeSchema = new mongoose.Schema({
  fare_id: String,
  price: Number,
  currency_type: String,
  payment_method: Number,
  transfers: Number,
  agency_id: String,
  old_fare_id: String,
});

export default mongoose.model('FareAttribute', FareAttributeSchema);