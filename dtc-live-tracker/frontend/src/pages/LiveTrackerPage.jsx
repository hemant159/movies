import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Map from '../components/Map';
import SearchBar from '../components/SearchBar';
import BusList from '../components/BusLIst';
import DestinationForm from '../components/DestinationForm'; // If you want manual rerouting here

const LiveTrackerPage = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:5001');

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('busUpdates', (data) => {
      setBuses(data);
    });

    socket.on('disconnect', () => {
      console.warn('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: '25%', overflowY: 'auto' }}>
        <SearchBar setSelectedBusId={setSelectedBusId} />
        <BusList buses={buses} setSelectedBusId={setSelectedBusId} />
        <DestinationForm />
      </div>
      <div style={{ width: '75%', height: '100%' }}>
        <Map buses={buses} selectedBusId={selectedBusId} />
      </div>
    </div>
  );
};

export default LiveTrackerPage;
