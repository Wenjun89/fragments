# Week 12: Databases on AWS - DynamoDB

## Lecture

<https://www.youtube.com/watch?v=3VH5f2hT0g8>

## Introduction

Welcome to Week 12, where we'll explore databases on AWS with a specific focus on Amazon DynamoDB. This week covers key-value stores, working with DynamoDB in code and from the command line, and you'll be adding DynamoDB as the storage layer for your fragment service in the lab.

## Database Options on AWS

While we'll focus on DynamoDB, AWS offers numerous database options depending on your data type and application needs:

- **Relational databases**: RDS (MySQL, PostgreSQL), Redshift
- **Document databases**: DocumentDB (managed MongoDB)
- **In-memory databases**: ElastiCache (Redis, Memcached), MemoryDB
- **Search databases**: OpenSearch (Amazon's fork of Elasticsearch)
- **Graph databases**: Neptune
- **Time series databases**: Timestream
- **Data warehousing**: Redshift

You can also run any database on your own EC2 instances or ECS/EKS clusters if you prefer self-managed solutions.

## Database Technology Overview

### SQL Databases (1970s)

SQL databases were created when storage was expensive, emphasizing:

- **Data normalization** and deduplication
- **Schema enforcement** by the database
- **Complex operations** like joins, aggregation, filtering
- **Vertical scaling** (bigger servers)
- **Connection pool limitations**

Popular options include Oracle, MySQL, PostgreSQL, and Microsoft SQL Server.

### NoSQL Databases (2000s)

NoSQL emerged to handle massive scale requirements:

- **Horizontal scaling** (more servers, not bigger ones)
- **Loose or no schema** requirements
- **Simple key-value or document storage**
- **Application-managed logic** (less database-side processing)

#### MongoDB Example

- **Document-based** approach
- **Binary JSON (BSON)** format with typing information
- **16MB document size limit**
- **Disk-based storage** for durability
- **Complex queries** and data structures supported
- **AWS equivalent**: DocumentDB

#### Redis Example

- **Data structure server** (strings, hashes, lists, sets)
- **In-memory storage** for speed
- **Typically used for caching** and session storage
- **Pub/sub capabilities** for real-time applications
- **AWS equivalent**: MemoryDB

## Local Database Setup with Docker

### Redis Setup

```yaml
redis:
  image: redis:alpine
  environment:
    - REDIS_PASSWORD=your_password
  command: redis-server --requirepass ${REDIS_PASSWORD}
  ports:
    - '6379:6379'
```

### MongoDB Setup

```yaml
mongodb:
  image: mongo
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=password
  ports:
    - '27017:27017'
```

**Security Note**: Never expose databases to the public internet without proper authentication. Use internal Docker networking when possible.

## Amazon DynamoDB

### Origins and Design Philosophy

DynamoDB was built by Amazon to solve Amazon-scale problems:

- **Reliability at massive scale**
- **Millions of components** with constant failures
- **Geographic distribution** across data centers
- **Always-on availability** regardless of infrastructure failures

As stated in Amazon's paper: "Dealing with failures in an infrastructure comprised of millions of components is our standard mode of operation."

### Key Features

#### Fully Managed

- No server administration required
- Automatic scaling, backups, and maintenance
- Focus on reading and writing data, not infrastructure

#### Serverless Architecture

- No connection pool limits
- Scales from 1 to 10 million concurrent connections
- Consistent performance at any scale

#### Durability and Availability

- Data partitioned and replicated across multiple availability zones
- Automatic replication to three storage nodes
- Survives data center failures

#### Consistency Models

- **Eventual consistency**: Faster reads, potential for stale data during replication
- **Strong consistency**: Slower reads, guaranteed up-to-date data

#### Pricing and Performance

- Pay for reads, writes, and storage
- Consistent performance regardless of data size
- Some operations limited to maintain scalability

## DynamoDB Core Concepts

### Tables

- Typically **one table per application** (single-table design)
- Has a name, primary key, and region
- No limit on number of items
- Data partitioned by primary key

### Items

- Records in a table (similar to rows in SQL or documents in MongoDB)
- Collection of attributes
- Must have a unique primary key
- Maximum size: 400KB

### Attributes

- Smallest unit of data (like columns in SQL)
- Typed data: strings, numbers, booleans, sets, maps
- No required schema - items can have different attributes

### Primary Keys

#### Simple Primary Key

- **Partition Key only** (also called Hash Key or PK)
- Must be unique across all items
- Used to calculate hash for data placement

#### Composite Primary Key

- **Partition Key + Sort Key** (Sort Key also called Range Key)
- Partition Key groups related items
- Sort Key orders items within a partition
- Combination must be unique

### Data Distribution Architecture

When you write data to DynamoDB:

1. Item written to primary storage node
2. Automatically replicated to two additional nodes
3. Nodes distributed across different availability zones
4. Write confirmed after replication to at least one additional node

## Working with DynamoDB in Code

### Client Setup

```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-2' });
const docClient = DynamoDBDocumentClient.from(client);
```

### Putting Items

```javascript
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const putCommand = new PutCommand({
  TableName: 'fragments',
  Item: {
    ownerId: 'user123',
    id: 'fragment456',
    created: new Date().toISOString(),
    updated: Date.now(),
    type: 'text/plain',
    size: 1024,
  },
});

await docClient.send(putCommand);
```

### Getting Single Items

```javascript
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const getCommand = new GetCommand({
  TableName: 'fragments',
  Key: {
    ownerId: 'user123',
    id: 'fragment456',
  },
});

const data = await docClient.send(getCommand);
const item = data?.Item;
```

### Querying Multiple Items

```javascript
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const queryCommand = new QueryCommand({
  TableName: 'fragments',
  KeyConditionExpression: 'ownerId = :pk',
  ExpressionAttributeValues: {
    ':pk': 'user123',
  },
});

const data = await docClient.send(queryCommand);
const items = data?.Items || [];
```

### Deleting Items

```javascript
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

const deleteCommand = new DeleteCommand({
  TableName: 'fragments',
  Key: {
    ownerId: 'user123',
    id: 'fragment456',
  },
});

await docClient.send(deleteCommand);
```

## Local Development with DynamoDB Local

### Docker Setup

```bash
docker run -p 8000:8000 amazon/dynamodb-local \
  -jar DynamoDBLocal.jar -inMemory
```

### Creating Tables with AWS CLI

```bash
aws dynamodb create-table \
  --table-name fragments \
  --attribute-definitions \
    AttributeName=ownerId,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=ownerId,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=10,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000
```

### Client Configuration for Local Development

```javascript
const client = new DynamoDBClient({
  region: 'us-east-2',
  endpoint: 'http://localhost:8000',
});
```

## Data Types in DynamoDB

DynamoDB supports several data types:

- **String (S)**: Text data
- **Number (N)**: Numeric data
- **Boolean (BOOL)**: True/false values
- **Binary (B)**: Binary data
- **String Set (SS)**: Set of strings
- **Number Set (NS)**: Set of numbers
- **Binary Set (BS)**: Set of binary values
- **Map (M)**: Nested object
- **List (L)**: Array of values
- **Null (NULL)**: Null value

## Design Considerations

### Single-Table Design

- Store all application data in one table
- Use partition keys to separate different entity types
- Use sort keys to create relationships and enable queries

### Query Patterns

- Design your primary key based on your access patterns
- Partition key determines data location and query performance
- Sort key enables range queries and sorting

### Application Logic

- More business logic moves to the application layer
- Database handles less complex operations
- Application manages aggregation, filtering, and sorting

This foundation prepares you for implementing DynamoDB as the storage layer in your fragment service, where you'll store metadata while using S3 for the actual fragment data.
