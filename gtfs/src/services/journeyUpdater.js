const LiveBus = require('../models/LiveBus');
const Trip = require('../models/Trip');
const StopTime = require('../models/StopTime');
const Stop = require('../models/Stop');
const BusJourney = require('../models/BusJourney');

async function processBusJourneys() {
  const liveBuses = await LiveBus.find({}).lean();
  if (!liveBuses || liveBuses.length === 0) {
    console.log("No live bus data available.");
    return;
  }

  for (const bus of liveBuses) {
    const { vehicle_id, route_id, trip_id } = bus;
    console.log(`Processing vehicle_id=${vehicle_id}, route_id=${route_id}, trip_id=${trip_id}`);

    if (!vehicle_id || !trip_id || !route_id) {
      console.log(`Skipping bus due to missing data: vehicle_id=${vehicle_id}, trip_id=${trip_id}, route_id=${route_id}`);
      continue;
    }

    console.log(`Querying Trip with { trip_id: "${trip_id}", route_id: "${route_id}" }`);
    const trip = await Trip.findOne({ trip_id, route_id }).lean();

    if (!trip) {
      console.log(`No trip found for trip_id=${trip_id} and route_id=${route_id}`);
      continue;  // Move to next bus if no trip
    } else {
      console.log(`Found trip: ${JSON.stringify(trip)}`);
    }

    // Fetch the stop_times for this trip, sorted by stop_sequence
    console.log(`Querying stop_times for trip_id="${trip_id}"`);
    let stopTimes = await StopTime.find({ trip_id }).lean();
    if (!stopTimes || stopTimes.length === 0) {
      console.log(`No stop_times found for trip_id=${trip_id}`);
      continue;
    }

    // Sort the stop_times by stop_sequence numerically
    stopTimes.sort((a, b) => parseInt(a.stop_sequence, 10) - parseInt(b.stop_sequence, 10));
    console.log(`Found ${stopTimes.length} stop_times for trip_id=${trip_id}`);

    // Extract the ordered stop_ids from stop_times
    const stopIds = stopTimes.map(st => st.stop_id);
    console.log(`Stop IDs: ${JSON.stringify(stopIds)}`);

    // Fetch all stops for these stop_ids
    console.log(`Querying Stops with stop_id in: ${JSON.stringify(stopIds)}`);
    const stopsData = await Stop.find({ stop_id: { $in: stopIds } }).lean();
    if (!stopsData || stopsData.length === 0) {
      console.log(`No stops found for these stop_ids`);
      continue;
    }
    console.log(`Found ${stopsData.length} stops for the trip.`);

    // Create a map of stop_id to stop object for quick lookup
    const stopsById = {};
    for (const s of stopsData) {
      stopsById[s.stop_id] = s;
    }

    // Derive first_stop, last_stop, intermediate_stops from the ordered stop IDs
    const orderedStops = stopIds.map(id => stopsById[id]).filter(Boolean);
    // orderedStops is an array of stop documents in the correct sequence

    if (orderedStops.length === 0) {
      console.log("No valid stops found after filtering.");
      continue;
    }

    const firstStopName = orderedStops[0].stop_name;
    const lastStopName = orderedStops[orderedStops.length - 1].stop_name;
    const intermediateStopNames = orderedStops.slice(1, -1).map(st => st.stop_name);

    console.log(`Derived first_stop="${firstStopName}", last_stop="${lastStopName}", intermediate_stops count=${intermediateStopNames.length}`);

    // Finalize old journey if needed (unrelated to conditions, just finalize if needed)
    const activeJourney = await BusJourney.findOne({ vehicle_id, last_stop: null, trip_id: { $ne: trip_id } }).lean();
    if (activeJourney) {
      console.log(`Finalizing old journey trip_id=${activeJourney.trip_id}`);
      let finalStop = activeJourney.first_stop;
      if (activeJourney.intermediate_stops && activeJourney.intermediate_stops.length > 0) {
        finalStop = activeJourney.intermediate_stops[activeJourney.intermediate_stops.length - 1];
      }

      console.log(`Updating old journey with last_stop=${finalStop}`);
      await BusJourney.updateOne(
        { vehicle_id, trip_id: activeJourney.trip_id },
        { $set: { last_stop: finalStop } }
      );
      console.log(`Old journey finalized for vehicle=${vehicle_id}, trip_id=${activeJourney.trip_id}`);
    }

    // Now create or update the current journey
    let journey = await BusJourney.findOne({ vehicle_id, trip_id }).lean();

    if (!journey) {
      console.log(`No journey found for vehicle_id=${vehicle_id}, trip_id=${trip_id}. Creating new one now...`);
      const newJourney = {
        vehicle_id,
        route_id,
        trip_id,
        first_stop: firstStopName,
        last_stop: lastStopName,
        intermediate_stops: intermediateStopNames
      };
      await BusJourney.insertMany([newJourney]);
      console.log(`New journey created for vehicle=${vehicle_id}, trip_id=${trip_id}`);
    } else {
      console.log(`Journey already exists for vehicle_id=${vehicle_id}, trip_id=${trip_id}. Updating journey.`);
      // Update the journey with new stops (you can decide if you want to replace or merge)
      await BusJourney.updateOne(
        { vehicle_id, trip_id },
        { $set: { 
          first_stop: firstStopName,
          last_stop: lastStopName,
          intermediate_stops: intermediateStopNames
        }}
      );
      console.log(`Journey updated for vehicle=${vehicle_id}, trip_id=${trip_id}.`);
    }
  }
}

module.exports = { processBusJourneys };
