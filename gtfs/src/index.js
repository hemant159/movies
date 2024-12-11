const connectDB = require('./config/db');
const { processBusJourneys } = require('./services/journeyUpdater');
const { UPDATE_INTERVAL_MS } = require('./config/env');

(async function main() {
  await connectDB();
  console.log("Starting bus journey processing...");

  setInterval(() => {
    processBusJourneys().catch(err => console.error("Error processing journeys:", err));
  }, UPDATE_INTERVAL_MS);
})();
