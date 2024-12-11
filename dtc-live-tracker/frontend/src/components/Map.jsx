import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const Map = ({ buses, selectedBusId }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const [routes, setRoutes] = useState([]);

  // Focus on the selected bus
  useEffect(() => {
    if (selectedBusId && mapRef.current) {
      const selectedBus = buses.find((bus) => bus.vehicle_id === selectedBusId);
      if (selectedBus) {
        const { latitude, longitude } = selectedBus;
        mapRef.current.panTo({ lat: latitude, lng: longitude });
        mapRef.current.setZoom(15); // Zoom in closer
      } else {
        alert('Bus not found');
      }
    }
  }, [selectedBusId, buses]);

  const displayedBuses = selectedBusId
    ? buses.filter((bus) => bus.vehicle_id === selectedBusId)
    : buses;

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 28.6139, lng: 77.2090 }} // Centered on Delhi
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {displayedBuses.map((bus) => (
        <Marker
          key={bus.vehicle_id}
          position={{ lat: bus.latitude, lng: bus.longitude }}
          label={bus.vehicle_id}
          icon={
            bus.vehicle_id === selectedBusId
              ? {
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                }
              : undefined
          }
          onClick={() => {
            alert(`Bus ID: ${bus.vehicle_id}\nTrip ID: ${bus.trip_id}`);
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default React.memo(Map);
