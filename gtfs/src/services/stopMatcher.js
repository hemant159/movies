const Stop = require('../models/Stop');
const LiveBus = require('../models/LiveBus');
const BusStopMatch = require('../models/BusStopMatch');
const { normalizeCoord } = require('../utils/coordinates');

/**
 * Find a stop for the given bus coordinates.
 * Logs out the process for debugging.
 */
async function findStopForPosition(lat, lon) {
  console.log(`Attempting to find stop for bus coordinates: lat=${lat}, lon=${lon}`);

  const latStr = normalizeCoord(lat);
  const lonStr = normalizeCoord(lon);

  console.log(`Normalized coordinates for stop lookup: lat=${latStr}, lon=${lonStr}`);

  // Remove `.exec()` since findOne returns a promise directly
  const stop = await Stop.findOne({ stop_lat: latStr, stop_lon: lonStr });

  if (stop) {
    console.log(`Found matching stop: ${stop.stop_name} (ID: ${stop._id}) for lat=${latStr}, lon=${lonStr}`);
  } else {
    console.log(`No matching stop found for lat=${latStr}, lon=${lonStr}`);
  }

  return stop;
}

/**
 * Process all live bus positions from live_buses, find matching stops,
 * and store the results in bus_stop_matches.
 */
async function matchBusStops() {
  try {
    // Fetch current live bus positions
    const liveEntries = await LiveBus.find({}, {
      _id: 0,
      vehicle_id: 1,
      latitude: 1,
      longitude: 1,
      timestamp: 1,
      route_id: 1,
      trip_id: 1
    }).lean();

    if (!liveEntries || liveEntries.length === 0) {
      console.log("No live bus data available for matching.");
      return;
    }

    console.log(`Processing ${liveEntries.length} bus entries for stop matching...`);

    const bulkOps = [];
    for (const entry of liveEntries) {
      const { vehicle_id, latitude, longitude, timestamp, route_id, trip_id } = entry;
      if (latitude == null || longitude == null) {
        console.log(`Skipping vehicle ${vehicle_id} due to missing coordinates.`);
        continue;
      }

      const matchedStop = await findStopForPosition(latitude, longitude);

      const matchData = {
        vehicle_id,
        timestamp,
        route_id,
        trip_id,
        matched_stop_id: matchedStop?._id || null,
        matched_stop_name: matchedStop?.stop_name || null
      };

      bulkOps.push({
        updateOne: {
          filter: { vehicle_id },
          update: { $set: matchData },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      const result = await BusStopMatch.bulkWrite(bulkOps);
      console.log(`Stop matching completed. Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);
    } else {
      console.log("No bus positions were processed for stop matching.");
    }

  } catch (err) {
    console.error("Error in stop matching process:", err);
  }
}

module.exports = { findStopForPosition, matchBusStops };
