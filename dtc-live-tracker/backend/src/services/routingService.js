import Trip from '../models/Trip.js';
import Stop from '../models/Stop.js';
import { getDirections, getOptimizedRoute } from './googleMapsService.js';

export const getOfficialRoutePolyline = async (trip_id) => {
  const trip = await Trip.findOne({ trip_id: trip_id.toString() });
  if (!trip) return null;
  // Retrieve shape data from DB if available.
  return null;
};

export const getShortestRoute = async (originStopId, destinationStopId) => {
  const originStop = await Stop.findOne({ stop_id: originStopId.toString() });
  const destStop = await Stop.findOne({ stop_id: destinationStopId.toString() });
  if (!originStop || !destStop) return null;

  const origin = { lat: originStop.stop_lat, lng: originStop.stop_lon };
  const destination = { lat: destStop.stop_lat, lng: destStop.stop_lon };

  const directionsData = await getDirections(origin, destination);
  return directionsData;
};

export const getOptimizedRoutePlan = async (stopIds) => {
  const stops = await Stop.find({ stop_id: { $in: stopIds.map(id => id.toString()) } });
  const stopMap = {};
  stops.forEach(s => stopMap[s.stop_id] = s);
  const stopsCoordinates = stopIds.map(id => ({ lat: stopMap[id].stop_lat, lng: stopMap[id].stop_lon }));

  const optimizedData = await getOptimizedRoute(stopsCoordinates);
  return optimizedData;
};

export const assignBusToRoute = async (bus, route_id) => {
  bus.route_id = route_id;
  await bus.save();
  return bus;
};

export const changeBusDestination = async (bus, newDestinationStopId) => {
  // Re-run shortest route or optimization if needed
  bus.route_id = null;
  await bus.save();
  return bus;
};