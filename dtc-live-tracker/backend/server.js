import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import busesRoutes from './src/routes/buses.js';
import Bus from './src/models/Bus.js';
import schedulingRoutes from './src/routes/scheduling.js';
import routesRoutes from './src/routes/routes.js';
import crewRoutes from './src/routes/crew.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// **CORS Configuration**
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  credentials: true // Allow cookies and credentials
}));

// **API Routes**
app.use('/api/buses', busesRoutes);
app.use('/api/routes', routesRoutes); 
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/crew', crewRoutes)

// **Create HTTP server and Socket.IO instance**
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for WebSocket
    methods: ['GET', 'POST'],
    credentials: true // Allow cookies and credentials for WebSockets
  }
});

// **Socket.IO connection**
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// **Connect to MongoDB**
mongoose.connect(process.env.MONGO_URI, { dbName: 'dtc_scheduling' })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');

    // **Emit bus updates every 10 seconds**
    setInterval(async () => {
      try {
        const buses = await Bus.find({});
        io.emit('busUpdates', buses); // Send the bus updates to all connected clients
        console.log('🚌 Bus updates sent to clients');
      } catch (error) {
        console.error('❌ Error during bus updates:', error);
      }
    }, 10000);

    // **Start the server**
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
