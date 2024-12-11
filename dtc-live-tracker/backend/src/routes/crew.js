import express from 'express';
import CrewMember from '../models/CrewMember.js';
import Route from '../models/Route.js';

const router = express.Router();

router.get('/crewDetail', async (req, res) => {
    try {
        const crews = await CrewMember.find({});
        res.status(200).json(crews);
    } catch (error) {
        console.error('Error fetching crew data:', error);
    res.status(500).json({ error: 'Failed to fetch crew data' });
    }
});

export default router;