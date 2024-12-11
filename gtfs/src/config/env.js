require('dotenv').config();

const MONGO_URI = `mongodb://localhost:27017/`;
const DB_NAME = process.env.DB_NAME || 'dtc_scheduling';
const UPDATE_INTERVAL_MS = parseInt(process.env.UPDATE_INTERVAL_MS, 10) || 10000;

if (!MONGO_URI) {
  console.error("MONGO_URI must be set in the .env file");
  process.exit(1);
}

module.exports = {
  MONGO_URI,
  DB_NAME,
  UPDATE_INTERVAL_MS
};
