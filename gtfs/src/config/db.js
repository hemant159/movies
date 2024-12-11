const mongoose = require('mongoose');
const { MONGO_URI, DB_NAME } = require('./env');

mongoose.set('strictQuery', false);

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Connected to MongoDB database: ${DB_NAME}`);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
