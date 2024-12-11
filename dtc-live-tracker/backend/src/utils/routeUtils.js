import Trip from "../models/Trip.js";
import StopTime from "../models/StopTime.js";
import Stop from "../models/Stop.js";

export const findRouteIdForBus = async (trip_id) => {
  const trip = await Trip.findOne({ trip_id });
  return trip ? trip.route_id : null;
};

export const findFirstAndLastStopsForBus = async (trip_id) => {
  const stopTimes = await StopTime.find({ trip_id }).sort("stop_sequence");
  if (!stopTimes || stopTimes.length === 0) return { firstStop: null, lastStop: null };

  const firstStop = await Stop.findOne({ stop_id: stopTimes[0].stop_id });
  const lastStop = await Stop.findOne({ stop_id: stopTimes[stopTimes.length - 1].stop_id });

  return { firstStop, lastStop };
};
