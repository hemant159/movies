import express from 'express';
import Route from '../models/Route.js';
import { findOverlappingRoutes, getRouteData } from '../controllers/routeController.js';

const router = express.Router();

// Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Get route by route_id
router.get('/:route_id', async (req, res) => {
  try {
    const route = await Route.findOne({ route_id: req.params.route_id });
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route data' });
  }
});

router.get('/:route_id/overlaps', findOverlappingRoutes);
router.get('/plan', getRouteData);

export default router;