import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

function App() {
  const [journeys, setJourneys] = useState([]);
  
  useEffect(() => {
    // Initial fetch with Axios
    axios.get('http://localhost:4000/api/journeys')
      .then(response => {
        setJourneys(response.data);
      })
      .catch(err => console.error('Error fetching journeys:', err));
  
    // Connect to Socket.IO
    const socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'], // ensure WebSocket support
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server with id:', socket.id);
    });

    socket.on('journeyUpdate', (updatedJourneys) => {
      console.log('Received journeyUpdate from server:', updatedJourneys);
      setJourneys(updatedJourneys);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Bus Journeys</h1>
      {journeys.map(journey => (
        <div key={journey._id}>
          <h2>Trip ID: {journey.trip_id}</h2>
          <h2>Vehicle Id: {journey.vehicle_id}</h2>
          <p>First Stop: {journey.first_stop}</p>
          <p>Last Stop: {journey.last_stop}</p>
          <p>Intermediate Stops: {journey.intermediate_stops.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
