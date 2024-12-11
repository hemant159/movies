import React, { useState } from 'react';
import axios from 'axios';
import Map from '../components/Map';

const RoutePlannerPage = () => {
  const [originStopId, setOriginStopId] = useState('');
  const [destinationStopId, setDestinationStopId] = useState('');
  const [useOfficial, setUseOfficial] = useState(false);
  const [optimize, setOptimize] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const handlePlanRoute = async () => {
    const response = await axios.get('http://localhost:5001/api/routes/plan', {
      params: {
        origin_stop_id: originStopId,
        destination_stop_id: destinationStopId,
        useOfficial: useOfficial.toString(),
        optimize: optimize.toString(),
      },
    });
    setRouteData(response.data);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '25%', padding: '10px' }}>
        <h2>Route Planner</h2>
        <input
          placeholder="Origin stop id"
          value={originStopId}
          onChange={(e) => setOriginStopId(e.target.value)}
        />
        <input
          placeholder="Destination stop id"
          value={destinationStopId}
          onChange={(e) => setDestinationStopId(e.target.value)}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={useOfficial}
              onChange={(e) => setUseOfficial(e.target.checked)}
            />
            Use Official Route
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={optimize}
              onChange={(e) => setOptimize(e.target.checked)}
            />
            Optimize Multiple Stops
          </label>
        </div>
        <button onClick={handlePlanRoute}>Plan Route</button>
      </div>
      <div style={{ width: '75%', height: '100%' }}>
        <Map routeData={routeData} />
      </div>
    </div>
  );
};

export default RoutePlannerPage;
