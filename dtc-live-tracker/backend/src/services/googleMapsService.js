import fetch from 'node-fetch';

// Directions API: For shortest path between two points or small sets of waypoints
export const getDirections = async (origin, destination, waypoints = []) => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    key: process.env.API_KEY,
  });
  if (waypoints.length > 0) {
    params.set('waypoints', 'optimize:true|' + waypoints.map(w => `${w.lat},${w.lng}`).join('|'));
  }

  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// Route Optimization API:
// This is a conceptual example. The actual request and parameters depend on your use case.
// Check Google's Route Optimization API docs for the request format.
// We'll assume a POST request to an endpoint with JSON body specifying vehicles, shipments (stops), etc.
export const getOptimizedRoute = async (stops) => {
  // stops: array of { lat, lng }
  // Example body (This is a mock body - you'd need to structure according to the API spec)
  const body = {
    // The Route Optimization API might differ depending on the product you are using,
    // for demonstration, we show a pseudo structure:
    // See official docs: https://developers.google.com/maps/documentation/routes_optimize
    vehicles: [{
      startLocation: { latitude: stops[0].lat, longitude: stops[0].lng },
      endLocation: { latitude: stops[stops.length-1].lat, longitude: stops[stops.length-1].lng },
      // ...other vehicle specs
    }],
    shipments: stops.slice(1, stops.length-1).map((stop, idx) => ({
      id: `shipment-${idx}`,
      location: { latitude: stop.lat, longitude: stop.lng }
    }))
  };

  const url = `https://routespreferred.googleapis.com/v1:computeRoutes?key=${process.env.ROUTE_OPTIMIZATION_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return data;
};
