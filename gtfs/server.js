const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors'); // Import CORS
const BusJourney = require('./src/models/BusJourney');
const liveData = require('./src/models/LiveBus');
const Stop = require('./src/models/Stop');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dtc_scheduling', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

// **Enable CORS Middleware**
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend requests
  methods: ['GET', 'POST'], // Allow GET, POST requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow custom headers if needed
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"]
  }
});

// REST Endpoint to fetch all journeys
app.get('/api/journeys', async (req, res) => {
  try {
    const journeys = await BusJourney.find({}).lean();
    res.json(journeys);
  } catch (err) {
    console.error('Error fetching journeys:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stop/:stop_name', async (req, res) => {
  try {
    const stopName = decodeURIComponent(req.params.stop_name);
    console.log(`Looking for stop with name: ${stopName}`);

    const stop = await Stop.findOne({ stop_name: stopName }).lean();

    if (!stop) {
      console.log(`Stop not found for name: ${stopName}`);
      return res.status(404).json({ error: 'Stop not found' });
    }

    res.json({
      stop_lat: stop.stop_lat,
      stop_lon: stop.stop_lon,
      stop_name: stop.stop_name
    });
  } catch (error) {
    console.error('Error fetching stop data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/allRoutes', async (req, res) => {
  try {
    const allRoutes = await BusJourney.find({}).lean();
    res.json(allRoutes);
  } catch (error) {
    console.error('Error fetching all routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REST Endpoint to fetch a specific vehicle journey
app.get('/api/:vehicle_id', async (req, res) => {
  try {
    const journeys = await BusJourney.find({ vehicle_id: req.params.vehicle_id }).lean();
    res.json(journeys);
  } catch (err) {
    console.error('Error fetching journeys:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REST Endpoint to fetch live bus data
app.get('/api/live', async (req, res) => {
  try {
    const live = await liveData.find({}).lean();
    res.json(live);
  } catch (err) {
    console.error('Error fetching journeys:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// **GET Route to fetch latitude and longitude of a stop by stop_name**
app.get('/api/stop/coordinates/:stop_name', async (req, res) => {
  const stopName = req.params.stop_name;

  try {
    // Find the stop in the database by the stop_name (case-insensitive)
    const stop = await Stop.findOne({ stop_name: { $regex: new RegExp(`^${stopName}$`, 'i') } }).lean();

    if (!stop) {
      return res.status(404).json({ message: `No stop found with name: ${stopName}` });
    }

    // Extract latitude and longitude from the stop document
    const coordinates = {
      stop_name: stop.stop_name,
      lat: parseFloat(stop.stop_lat),
      lon: parseFloat(stop.stop_lon)
    };

    return res.status(200).json(coordinates);
  } catch (error) {
    console.error(`Error fetching coordinates for stop_name=${stopName}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
});

// **A function that emits live updates**
async function notifyJourneyUpdates() {
  const journeys = await BusJourney.find({}).lean();
  io.emit('journeyUpdate', journeys);
  console.log('Emitted journeyUpdate event with new journey data.');
}

// Start the server
server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
