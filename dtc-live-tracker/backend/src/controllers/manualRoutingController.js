import Bus from '../models/Bus.js';
import { changeBusDestination } from '../services/routingService.js';

export const changeDestination = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const { new_stop_id } = req.body;

    const bus = await Bus.findOne({ vehicle_id });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const updatedBus = await changeBusDestination(bus, new_stop_id);
    res.status(200).json(updatedBus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change destination' });
  }
};