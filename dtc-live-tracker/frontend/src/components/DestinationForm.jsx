import React, { useState } from 'react';
import axios from 'axios';

const DestinationForm = () => {
  const [vehicleId, setVehicleId] = useState('');
  const [newStopId, setNewStopId] = useState('');

  const handleChangeDestination = async () => {
    await axios.put(`http://localhost:5000/api/manual-routing/${vehicleId}/destination`, {
      new_stop_id: newStopId
    });
    alert('Destination changed successfully');
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2>Change Bus Destination</h2>
      <input placeholder="Vehicle ID" value={vehicleId} onChange={e => setVehicleId(e.target.value)} />
      <input placeholder="New Stop ID" value={newStopId} onChange={e => setNewStopId(e.target.value)} />
      <button onClick={handleChangeDestination}>Change Destination</button>
    </div>
  );
};

export default DestinationForm;
