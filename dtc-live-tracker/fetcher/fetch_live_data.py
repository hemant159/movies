import time
import requests
from pymongo import MongoClient, UpdateOne
from google.transit import gtfs_realtime_pb2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

# Ensure that API_KEY and MONGO_URI are provided
if not API_KEY or not MONGO_URI:
    raise ValueError("API_KEY and MONGO_URI must be set in the .env file")

# Set up MongoDB client
client = MongoClient(MONGO_URI)
db = client['dtc_scheduling']

REALTIME_URL = f"https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key={API_KEY}"

def fetch_and_store_live_data():
    while True:
        try:
            response = requests.get(REALTIME_URL)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            time.sleep(10)
            continue

        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(response.content)
        bus_data = []
        for entity in feed.entity:
            if entity.HasField("vehicle"):
                vehicle = entity.vehicle
                trip = vehicle.trip
                position = vehicle.position
                
                # Extract all available fields
                bus_data.append({
                    "vehicle_id": vehicle.vehicle.id,
                    "label": vehicle.vehicle.label if vehicle.vehicle.HasField("label") else None,
                    "license_plate": vehicle.vehicle.license_plate if vehicle.vehicle.HasField("license_plate") else None,
                    "trip_id": trip.trip_id if trip.HasField("trip_id") else None,
                    "route_id": trip.route_id if trip.HasField("route_id") else None,
                    "schedule_relationship": trip.schedule_relationship if trip.HasField("schedule_relationship") else None,
                    "stop_id": vehicle.stop_id if vehicle.HasField("stop_id") else None,
                    "latitude": position.latitude if position.HasField("latitude") else None,
                    "longitude": position.longitude if position.HasField("longitude") else None,
                    "bearing": position.bearing if position.HasField("bearing") else None,
                    "speed": position.speed if position.HasField("speed") else None,
                    "occupancy_status": vehicle.occupancy_status if vehicle.HasField("occupancy_status") else None,
                    "timestamp": vehicle.timestamp if vehicle.HasField("timestamp") else None,
                })

        print(f"Fetched {len(bus_data)} buses")

        # Use bulk operations for efficiency
        operations = []
        for bus in bus_data:
            operations.append(
                UpdateOne(
                    {"vehicle_id": bus["vehicle_id"]},
                    {"$set": bus},
                    upsert=True
                )
            )

        if operations:
            db.live_buses.bulk_write(operations)
        else:
            print("No bus data to update.")

        time.sleep(10)

if __name__ == "__main__":
    fetch_and_store_live_data()
