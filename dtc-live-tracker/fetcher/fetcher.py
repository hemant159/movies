import requests
from google.transit import gtfs_realtime_pb2
import os
import pandas as pd
from dotenv import load_dotenv

# Load API key from the .env file
load_dotenv()

API_KEY = os.getenv("API_KEY")
REALTIME_URL = f"https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key={API_KEY}"

# Load GTFS Static Files
stops_df = pd.read_csv('stops.txt')
routes_df = pd.read_csv('routes.txt')
trips_df = pd.read_csv('trips.txt')
stop_times_df = pd.read_csv('stop_times.txt')
fare_attributes_df = pd.read_csv('fare_attributes.txt')

def fetch_full_bus_data():
    try:
        # Send a request to the API
        response = requests.get(REALTIME_URL)
        response.raise_for_status()  # Check for HTTP request errors
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return

    # Parse the Protocol Buffer response
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(response.content)
    
    for entity in feed.entity:
        if entity.HasField("vehicle"):
            vehicle = entity.vehicle
            
            trip_id = vehicle.trip.trip_id if vehicle.trip.HasField("trip_id") else None
            route_id = vehicle.trip.route_id if vehicle.trip.HasField("route_id") else None
            stop_id = vehicle.stop_id if vehicle.HasField("stop_id") else None

            # Lookup GTFS Static Data (Stops, Routes, Trips, Stop Times, Fares)
            stop_info = stops_df.loc[stops_df['stop_id'] == stop_id] if stop_id else None
            trip_info = trips_df.loc[trips_df['trip_id'] == trip_id] if trip_id else None
            route_info = routes_df.loc[routes_df['route_id'] == route_id] if route_id else None
            stop_time_info = stop_times_df.loc[(stop_times_df['trip_id'] == trip_id) & (stop_times_df['stop_id'] == stop_id)] if trip_id and stop_id else None
            fare_info = fare_attributes_df.loc[fare_attributes_df['fare_id'] == route_id] if route_id else None

            # Extract Static Fields
            stop_name = stop_info['stop_name'].values[0] if stop_info is not None and not stop_info.empty else "N/A"
            stop_lat = stop_info['stop_lat'].values[0] if stop_info is not None and not stop_info.empty else "N/A"
            stop_lon = stop_info['stop_lon'].values[0] if stop_info is not None and not stop_info.empty else "N/A"
            arrival_time = stop_time_info['arrival_time'].values[0] if stop_time_info is not None and not stop_time_info.empty else "N/A"
            departure_time = stop_time_info['departure_time'].values[0] if stop_time_info is not None and not stop_time_info.empty else "N/A"
            route_long_name = route_info['route_long_name'].values[0] if route_info is not None and not route_info.empty else "N/A"
            route_short_name = route_info['route_short_name'].values[0] if route_info is not None and not route_info.empty else "N/A"
            fare_id = fare_info['fare_id'].values[0] if fare_info is not None and not fare_info.empty else "N/A"
            price = fare_info['price'].values[0] if fare_info is not None and not fare_info.empty else "N/A"
            currency_type = fare_info['currency_type'].values[0] if fare_info is not None and not fare_info.empty else "N/A"

            # Print Real-Time & Static Data
            print("\n--- New Bus Data ---")
            print("Vehicle ID:", vehicle.vehicle.id if vehicle.vehicle.HasField("id") else "N/A")
            print("Trip ID:", trip_id)
            print("Route ID:", route_id)
            print("Stop ID:", stop_id)
            print("Stop Name:", stop_name)
            print("Stop Latitude:", stop_lat)
            print("Stop Longitude:", stop_lon)
            print("Arrival Time:", arrival_time)
            print("Departure Time:", departure_time)
            print("Route Long Name:", route_long_name)
            print("Route Short Name:", route_short_name)
            print("Fare ID:", fare_id)
            print("Price:", price)
            print("Currency Type:", currency_type)
            print("Latitude:", vehicle.position.latitude if vehicle.position.HasField("latitude") else "N/A")
            print("Longitude:", vehicle.position.longitude if vehicle.position.HasField("longitude") else "N/A")
            print("Speed (m/s):", vehicle.position.speed if vehicle.position.HasField("speed") else "N/A")
            print("Occupancy Status:", vehicle.occupancy_status if vehicle.HasField("occupancy_status") else "N/A")
            print("Timestamp:", vehicle.timestamp if vehicle.HasField("timestamp") else "N/A")

if __name__ == "__main__":
    fetch_full_bus_data()
