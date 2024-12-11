import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import dotenv from 'dotenv';
import Route from '../models/Route.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { dbName: 'dtc_scheduling' });

const shapes = {};

fs.createReadStream('shapes.txt')
  .pipe(csv())
  .on('data', (row) => {
    const { shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence } = row;
    if (!shapes[shape_id]) {
      shapes[shape_id] = [];
    }
    shapes[shape_id].push({
      lat: parseFloat(shape_pt_lat),
      lon: parseFloat(shape_pt_lon),
      sequence: parseInt(shape_pt_sequence),
    });
  })
  .on('end', async () => {
    console.log('CSV file successfully processed');
    for (const shape_id in shapes) {
      const shapePoints = shapes[shape_id]
        .sort((a, b) => a.sequence - b.sequence)
        .map((point) => [point.lon, point.lat]);

      // Update route with matching shape_id
      await Route.updateOne(
        { shape_id },
        {
          $set: {
            shape: {
              type: 'LineString',
              coordinates: shapePoints,
            },
          },
        }
      );
    }
    console.log('Shapes imported');
    mongoose.disconnect();
  });