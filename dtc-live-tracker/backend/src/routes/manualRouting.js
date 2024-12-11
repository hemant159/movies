import express from 'express';
import { changeDestination } from '../controllers/manualRoutingController.js';

const router = express.Router();

router.put('/:vehicle_id/destination', changeDestination);

export default router;