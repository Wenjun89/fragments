const db = require('./db');
const mqtt = require('mqtt');

module.exports.start = () => {
    console.log({url: process.env.MQTT_URL})
    const client = mqtt.connect(process.env.MQTT_URL);

    client.on('error', err => {
        console.error('MQTT error', err);
    })
    
    client.on('message', (topic, payload) => {
        // topic will be: device/:deviceId/temp
        const [, deviceId, ] = topic.split('/');
        const data = JSON.parse(payload);
    
        console.log('Got MQTT message', { deviceId, data });
        db.addReading(deviceId, data.sampleTime, data.temp);
    });
    
    client.on('connect', () => {
        client.subscribe('device/+/temp', err => {
            if(err) {
                console.error('Unable to subscribe to device/+/temp topic', err);
            } else {
                console.log('Subscribed to device/+/temp topic');
            }
        })
    });    
};
