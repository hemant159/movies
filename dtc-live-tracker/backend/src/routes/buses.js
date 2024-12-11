import express from 'express';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';

const router = express.Router();

// Get live buses
router.get('/live', async (req, res) => {
  try {
    const buses = await Bus.find({});
    res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching live buses:', error);
    res.status(500).json({ error: 'Failed to fetch live bus data' });
  }
});

// Get bus by vehicle_id
// Get bus by vehicle_id with route info
router.get('/:vehicle_id', async (req, res) => {
  try {
    const bus = await Bus.findOne({ vehicle_id: req.params.vehicle_id });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // Fetch route information
    const route = await Route.findOne({ route_id: bus.route_id });

    res.status(200).json({ bus, route });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bus data' });
  }
});


export default router;