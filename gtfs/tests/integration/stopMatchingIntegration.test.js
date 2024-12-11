const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Stop = require('../../src/models/Stop');
const LiveBus = require('../../src/models/LiveBus');
const BusStopMatch = require('../../src/models/BusStopMatch');
const { matchBusStops } = require('../../src/services/stopMatcher');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'test', useNewUrlParser: true, useUnifiedTopology: true });

  // Insert known stops
  await Stop.insertMany([
    { stop_name: "Stop A", stop_lat: "28.675241", stop_lon: "77.168236" },
    { stop_name: "Stop B", stop_lat: "28.000000", stop_lon: "77.000000" }
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Stop Matching Integration', () => {
  it('should update matched stop fields when a bus matches a stop', async () => {
    // Insert a live bus that matches "Stop A"
    await LiveBus.insertMany([
      {
        vehicle_id: "DL1PD5403",
        latitude: 28.675241470336914,
        longitude: 77.1682357788086,
        timestamp: 1733664308,
        route_id: "10547",
        trip_id: "10547_18_33"
      }
    ]);

    // Run matching logic
    await matchBusStops();

    const matchRecord = await BusStopMatch.findOne({ vehicle_id: "DL1PD5403" }).lean();
    expect(matchRecord).not.toBeNull();
    expect(matchRecord.matched_stop_name).toBe("Stop A");
  });

  it('should set matched_stop_id and matched_stop_name to null if no match is found', async () => {
    // Insert a bus that doesn't match any stop
    await LiveBus.insertMany([
      {
        vehicle_id: "DL1PD5404",
        latitude: 28.999999,
        longitude: 77.999999,
        timestamp: 1733664309,
        route_id: "10547",
        trip_id: "10547_19_33"
      }
    ]);

    await matchBusStops();

    const matchRecord = await BusStopMatch.findOne({ vehicle_id: "DL1PD5404" }).lean();
    expect(matchRecord).not.toBeNull();
    expect(matchRecord.matched_stop_id).toBeNull();
    expect(matchRecord.matched_stop_name).toBeNull();
  });
});
