# DynamoDB Example

In this example we'll use [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) to record [time-series data](https://www.influxdata.com/what-is-time-series-data/) from simulated [IoT](https://en.wikipedia.org/wiki/Internet_of_things) sensors.

We'll use node.js to simulate multiple sensors sending temperature data to an [MQTT broker](https://mqtt.org/), and write a node.js server to subscribe to these messages and put them in DynamoDB.

We'll also look at ways to query the data via a REST API.

## Setup

In order to run the example, do the following:

```sh
docker compose up
```

## Services

The following services will be started:

1. [Amazon DynamoDB Local](https://hub.docker.com/r/amazon/dynamodb-local)
2. [Eclipse Mosquitto MQTT Broker](https://hub.docker.com/_/eclipse-mosquitto)
3. 3x Instances of our IoT Device Mock (see [device-mock](./device-mock/))
4. A node.js server listening for MQTT messages

## API

To get temperature data, use the following URLs

> NOTE: the data will stream into the database every 5s, so it can take some time to get enough data for all queries to produce the expected values.

### GET All Temperature Data for Devices

1. <http://localhost:3000/temperatures/7ts47y>
2. <http://localhost:3000/temperatures/pytqry>
3. <http://localhost:3000/temperatures/jbsbzd>

### Limit the Number of Items Returned with `?limit=n`

1. <http://localhost:3000/temperatures/7ts47y?limit=10>
2. <http://localhost:3000/temperatures/pytqry?limit=50>
3. <http://localhost:3000/temperatures/jbsbzd?limit=100>

### Define the Period of Results with `?since=time`

1. <http://localhost:3000/temperatures/7ts47y?since=1m>
2. <http://localhost:3000/temperatures/pytqry?since=5m>
3. <http://localhost:3000/temperatures/jbsbzd?sinc=1h>

### GET the Current Value

1. <http://localhost:3000/temperatures/7ts47y/current>
2. <http://localhost:3000/temperatures/pytqry/current>
3. <http://localhost:3000/temperatures/jbsbzd/current>
