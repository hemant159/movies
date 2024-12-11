import StopTime from '../models/StopTime.js';
import { getOfficialRoutePolyline, getShortestRoute, getOptimizedRoutePlan } from '../services/routingService.js';
import Route from '../models/Route.js';

export const findOverlappingRoutes = async (req, res) => {
  try {
    const { route_id } = req.params;
    const route = await Route.findOne({ route_id });
    if (!route) return res.status(404).json({ error: 'Route not found' });

    const overlappingRoutes = await Route.find({
      _id: { $ne: route._id },
      shape: {
        $geoIntersects: {
          $geometry: route.shape,
        },
      },
    });

    res.status(200).json(overlappingRoutes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to find overlapping routes' });
  }
};

export const getRouteData = async (req, res) => {
  try {
    const { origin_stop_id, destination_stop_id, useOfficial, optimize } = req.query;

    let routeData;
    if (optimize === 'true') {
      const stopsArray = [origin_stop_id, '146', '149', destination_stop_id]; // example stops
      const optimizedData = await getOptimizedRoutePlan(stopsArray);
      routeData = { type: 'optimized', optimizedData };
    } else if (useOfficial === 'true') {
      const trip_id = "1421250";
      const polyline = await getOfficialRoutePolyline(trip_id);
      const stopTimes = await StopTime.find({ trip_id: trip_id.toString() });

      routeData = { type: 'official', polyline, stopTimes };
    } else {
      const directions = await getShortestRoute(origin_stop_id, destination_stop_id);
      routeData = { type: 'shortest', directions };
    }

    res.status(200).json(routeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch route data' });
  }
};