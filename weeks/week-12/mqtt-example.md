# DynamoDB and MQTT Integration Tutorial

## Lecture

<https://www.youtube.com/watch?v=SODQZal9MAk>

## Introduction

Welcome to this comprehensive tutorial on building a time series data collection system using DynamoDB, MQTT, and Docker. In this session, we'll explore how to create an industrial IoT monitoring system that collects sensor data in real-time and provides APIs for data analysis.

## System Overview

### Project Goals

We're building a system that simulates an industrial farming operation with distributed IoT sensors. The system will:

- Collect real-time data from multiple IoT devices (temperature, humidity, soil conditions)
- Store time series data in DynamoDB
- Provide REST APIs for data querying and analysis
- Support trend analysis and operational decision-making

### Architecture Components

Our system consists of several key components:

1. **MQTT Broker** - Handles message routing between IoT devices
2. **Simulated IoT Devices** - Generate fake sensor data
3. **DynamoDB** - Stores time series data
4. **Node.js Microservice** - Processes MQTT messages and provides REST APIs
5. **Docker Compose** - Orchestrates all services

## Understanding MQTT

### What is MQTT?

MQTT (Message Queuing Telemetry Transport) is a lightweight messaging protocol designed specifically for IoT devices. Unlike HTTP, MQTT is optimized for:

- Low power consumption
- Unreliable network connections
- Minimal bandwidth usage
- Device-to-device communication

### MQTT Architecture

The MQTT architecture follows a publish-subscribe pattern:

```text
[IoT Devices] → [MQTT Broker] → [Subscribers]
```

- **Publishers** send messages to topics
- **Broker** routes messages to appropriate subscribers
- **Subscribers** receive messages from topics they've subscribed to

### Key MQTT Concepts

- **Topics** - Message addresses (e.g., `device/1/temperature`)
- **Broker** - Central message router
- **Quality of Service (QoS)** - Message delivery guarantees
- **Retained Messages** - Last message stored for new subscribers

## Setting Up the Infrastructure

### Docker Compose Configuration

We'll use Docker Compose to orchestrate our services:

```yaml
version: '3.8'
services:
  dynamodb:
    container_name: dynamodb
    image: amazon/dynamodb-local
    command: ['-jar', 'DynamoDBLocal.jar', '-inMemory']
    ports:
      - '8000:8000'

  mqtt-broker:
    container_name: mqtt-broker
    image: eclipse-mosquitto:2
    ports:
      - '1883:1883'
    volumes:
      - ./config/mosquitto.conf:/mosquitto/config/mosquitto.conf
```

### MQTT Broker Configuration

The Mosquitto broker requires a configuration file:

```conf
# mosquitto.conf
allow_anonymous true
listener 1883
```

## Building the IoT Device Simulator

### Device Mock Implementation

Our simulated IoT devices will:

- Generate random temperature readings (50-100°F)
- Publish data every 5 seconds
- Include timestamps for time series analysis
- Use unique device IDs for identification

### Key Dependencies

```javascript
const mqtt = require('mqtt');
const { faker } = require('@faker-js/faker');
```

### Device Code Structure

```javascript
const deviceId = process.env.DEVICE_ID;
const clientId = `client-${deviceId}`;
const topic = `device/${deviceId}/temperature`;

const client = mqtt.connect(process.env.MQTT_URL, { clientId });

// Publish temperature data every 5 seconds
setInterval(() => {
  const payload = {
    temperature: faker.datatype.float({ min: 50, max: 100 }),
    sampleTime: Date.now(),
  };

  const message = JSON.stringify(payload);
  client.publish(topic, message);

  console.log(`Device ${deviceId} published:`, { topic, message });
}, 5000);
```

## DynamoDB Integration

### Table Design

For time series data, we'll use:

- **Partition Key**: `deviceId` (string) - Groups data by device
- **Sort Key**: `sampleTime` (number) - Orders data chronologically
- **Attributes**: `temperature` (number) - The sensor reading

### Creating Tables Programmatically

Instead of using CLI scripts, we'll create tables in code:

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-2',
  endpoint: process.env.DYNAMODB_ENDPOINT_URL,
  credentials: {
    accessKeyId: 'test-id',
    secretAccessKey: 'test-secret',
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
```

### Table Creation Logic

```javascript
async function createTable() {
  const command = new CreateTableCommand({
    TableName: 'sensor-data',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'deviceId', AttributeType: 'S' },
      { AttributeName: 'sampleTime', AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: 'deviceId', KeyType: 'HASH' },
      { AttributeName: 'sampleTime', KeyType: 'RANGE' },
    ],
  });

  await ddbDocClient.send(command);
}
```

## MQTT Message Processing

### Subscribing to Device Topics

Our microservice subscribes to all device temperature topics using wildcards:

```javascript
const client = mqtt.connect(process.env.MQTT_URL);

client.on('connect', () => {
  // Subscribe to all device temperature topics
  client.subscribe('device/+/temperature', (err) => {
    if (err) {
      console.error('Unable to subscribe:', err);
    } else {
      console.log('Subscribed to device temperature topics');
    }
  });
});
```

### Processing Incoming Messages

```javascript
client.on('message', async (topic, payload) => {
  // Parse topic to extract device ID
  const [, deviceId] = topic.split('/');

  // Parse message payload
  const data = JSON.parse(payload);

  // Store in database
  await db.addReading(deviceId, data.sampleTime, data.temperature);
});
```

## Database Operations

### Adding Sensor Readings

```javascript
async function addReading(deviceId, sampleTime, temperature) {
  try {
    const command = new PutCommand({
      TableName: 'sensor-data',
      Item: {
        deviceId,
        sampleTime,
        temperature,
      },
    });

    await ddbDocClient.send(command);
    console.log('Reading added successfully');
  } catch (error) {
    console.error('Unable to add reading:', error);
  }
}
```

### Querying Time Series Data

DynamoDB queries require specific syntax for time series data:

```javascript
async function getReadings(deviceId, options = {}) {
  const params = buildQueryParams(deviceId, options);

  try {
    const command = new QueryCommand(params);
    const response = await ddbDocClient.send(command);
    return response.Items;
  } catch (error) {
    console.error('Unable to query table:', error);
    return [];
  }
}
```

### Building Query Parameters

```javascript
function buildQueryParams(deviceId, { since, limit }) {
  let params = {
    TableName: 'sensor-data',
    ScanIndexForward: false, // Descending order (newest first)
    KeyConditionExpression: 'deviceId = :deviceId',
    ExpressionAttributeValues: {
      ':deviceId': deviceId,
    },
  };

  // Add time range filter if specified
  if (typeof since === 'number') {
    params.KeyConditionExpression += ' AND sampleTime >= :since';
    params.ExpressionAttributeValues[':since'] = since;
  }

  // Add limit if specified
  if (typeof limit === 'number' && limit > 0) {
    params.Limit = Math.min(limit, 300); // Cap at 300
  }

  return params;
}
```

## REST API Implementation

### Express Server Setup

```javascript
const express = require('express');
const app = express();

// Get current temperature for a device
app.get('/temperatures/:deviceId/current', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const readings = await db.getReadings(deviceId, { limit: 1 });

    if (!readings || readings.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No device found',
      });
    }

    res.json(readings[0].temperature);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Unable to get device temperature',
    });
  }
});
```

### Advanced Query Endpoints

```javascript
// Get temperature history with optional filters
app.get('/temperatures/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const since = parseSince(req.query.since);
    const limit = parseLimit(req.query.limit);

    const readings = await db.getReadings(deviceId, { since, limit });

    // Return only temperature values
    const temperatures = readings.map((reading) => reading.temperature);
    res.json(temperatures);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Unable to get device temperature readings',
    });
  }
});
```

### Query Parameter Parsing

```javascript
const ms = require('ms');

function parseSince(since) {
  if (since) {
    // Convert human-readable time to timestamp
    const sinceDate = new Date(Date.now() - ms(since));
    return sinceDate.getTime();
  }
  return undefined;
}

function parseLimit(limit) {
  if (limit) {
    return Math.min(parseInt(limit, 10), 300);
  }
  return 50; // Default limit
}
```

## API Usage Examples

### Getting Current Temperature

```bash
GET /temperatures/device1/current
Response: 87.42
```

### Getting Temperature History

```bash
GET /temperatures/device1?limit=10
Response: [87.42, 85.31, 89.76, ...]
```

### Time-Based Queries

```bash
GET /temperatures/device1?since=2h&limit=5
Response: [87.42, 85.31, 89.76, 91.23, 88.45]
```

## Docker Integration

### Multi-Container Setup

Our complete system runs multiple containers:

```yaml
services:
  device1:
    build: ./device-mock
    environment:
      DEVICE_ID: device1
      MQTT_URL: mqtt://mqtt-broker:1883

  device2:
    build: ./device-mock
    environment:
      DEVICE_ID: device2
      MQTT_URL: mqtt://mqtt-broker:1883

  mqtt-temps:
    build: ./mqtt-temps
    ports:
      - '3000:3000'
    environment:
      MQTT_URL: mqtt://mqtt-broker:1883
      DYNAMODB_ENDPOINT_URL: http://dynamodb:8000
```

### Service Dependencies

The microservice must wait for dependencies to be ready:

```javascript
async function init() {
  // Initialize database first
  await db.init();

  // Then start MQTT listener
  mqtt.start();

  // Finally start web server
  app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
  });
}
```

## Key Learning Points

### DynamoDB Best Practices

1. **Partition Key Design** - Use high-cardinality attributes (deviceId)
2. **Sort Key Usage** - Leverage timestamps for time series data
3. **Query Patterns** - Design keys to support your access patterns
4. **Limit Management** - Always set reasonable query limits

### MQTT Considerations

1. **Topic Design** - Use hierarchical naming (device/id/metric)
2. **Wildcard Subscriptions** - Use + for single-level wildcards
3. **Error Handling** - Always handle connection failures
4. **Message Format** - Use JSON for structured data

### Microservice Architecture

1. **Separation of Concerns** - Database, MQTT, and API logic in separate modules
2. **Error Handling** - Comprehensive try-catch blocks
3. **Environment Configuration** - Use environment variables for configuration
4. **Graceful Startup** - Initialize dependencies in correct order

## Conclusion

This tutorial demonstrated how to build a complete IoT data collection system using modern cloud technologies. We covered:

- MQTT protocol for IoT communication
- DynamoDB for time series data storage
- Docker containerization and orchestration
- REST API development with Express
- Real-time data processing patterns

The system provides a foundation for industrial IoT applications and demonstrates key patterns used in production cloud systems.
