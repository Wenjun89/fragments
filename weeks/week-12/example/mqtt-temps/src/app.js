const express = require('express');
// https://github.com/vercel/ms
const ms = require('ms');
const db = require('./db');

const app = express();

// Return a date time in the past, as ms
const parseSince = since => {
    if(since) {
        // Create a date that is in the past, '3m' -> 180000
        const sinceDate = new Date(Date.now() - ms(since));
        return sinceDate.getTime();
    }
};

const parseLimit= limit => {
    if(limit) {
        return parseInt(limit, 10);
    }
    // Use 300 as a default otherwise
    return 300;
}

// Return an array of temp values for the given device.
// Optionally limit it to only return a certain number,
// or give a time window (e.g., 1m or 2hours)
app.get('/temperatures/:deviceId/current', async (req, res) => {
    const { deviceId }  = req.params;

    try {
        const [ reading ] = await db.getReadings(deviceId, { limit: 1 });
        res.json(reading.temp);
    } catch(err) {
        console.error(err);
        res.status(500).json({
            status: 'Error',
            message: 'Unable to get current device temperature reading'
        });
    }
});

// Return an array of temp values for the given device.
// Optionally limit it to only return a certain number,
// or give a time window (e.g., 1m or 2hours)
app.get('/temperatures/:deviceId', async (req, res) => {
    const { deviceId }  = req.params;
    const since = parseSince(req.query.since);
    const limit = parseLimit(req.query.limit);

    try {
        const readings = await db.getReadings(deviceId, { since, limit });
        res.json(readings.map(reading => reading.temp));
    } catch(err) {
        console.error(err);
        res.status(500).json({
            status: 'Error',
            message: 'Unable to get device temperature readings'
        });
    }
});

module.exports = app;
