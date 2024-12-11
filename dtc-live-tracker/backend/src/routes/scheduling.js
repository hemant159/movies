import express from 'express';
import { createLinkedDutySchedule } from '../controllers/schedulingController.js';

const router = express.Router();

router.post('/linked', createLinkedDutySchedule);

// Add more routes for unlinked scheduling, etc.

export default router;