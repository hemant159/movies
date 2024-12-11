import React from 'react';

const BusList = ({ buses, setSelectedBusId }) => {
  return (
    <div style={{ maxHeight: '400px', overflowY: 'scroll', padding: '10px' }}>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {buses.map((bus) => (
          <li key={bus.vehicle_id} style={{ marginBottom: '5px' }}>
            <button
              onClick={() => setSelectedBusId(bus.vehicle_id)}
              style={{ padding: '5px', width: '100%' }}
            >
              Bus {bus.vehicle_id} - Route {bus.route_id || 'N/A'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusList;
