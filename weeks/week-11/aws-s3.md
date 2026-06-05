# Week 11: Object Storage and Amazon S3

## Lecture

<https://www.youtube.com/watch?v=OeTl6o-nRxI>

## Introduction to Object Storage

Welcome to week 11, where we explore object storage, a fundamental concept in cloud computing. We'll focus specifically on Amazon's Simple Storage Service (S3), which you've likely used before without realizing it. For example, when you upload files to Blackboard, you're actually using S3 behind the scenes.

## Traditional Storage Systems

Before diving into object storage, let's review the storage systems you're already familiar with:

### File Systems

- **Block-based storage**: Data stored in blocks on spinning disks or SSDs
- **Hierarchical structure**: Uses path systems, directories, and file names
- **Examples**: Local file systems, Amazon Elastic File System (EFS)

### Databases

- **Document or table-based**: Organized in rows with relationships between tables
- **Structured data**: SQL databases (MySQL, PostgreSQL) and NoSQL databases (MongoDB)
- **Complex queries**: Support for joins, relationships, and sophisticated data operations

## What is Object Storage?

Object storage represents a fundamentally different approach to data storage. Unlike file systems or databases, object storage doesn't require you to understand the underlying data structures.

### Key Characteristics

**What you don't think about:**

- Blocks on disk or data size limitations
- Relationships between items
- Hierarchical structures or categories

**What you do think about:**

- Collections of arbitrary **blobs** (Binary Large Objects)
- Any type of data: text, images, videos, zip files
- Unique keys for identification (similar to URLs or paths)

### The Bucket Metaphor

Think of object storage like a bucket at the beach. You collect various items of different sizes and types and throw them all into the bucket. That's exactly how S3 works - objects of any size or type stored in buckets.

## Objects and Buckets

### Objects

- **Unique piece of data**: Any size, any type
- **Unique name (key)**: Enables extremely fast retrieval (O(1) lookup time)
- **Flat hierarchy**: No complex directory structures

### Buckets

- **Container for objects**: Can hold infinite number of objects
- **Flat structure**: All keys exist at the same level
- **Unique identification**: Everything identifiable by its key name

## When to Use Object Storage

Object storage is ideal when you need:

### Scalable Data Storage

- Data that can grow extremely large
- No limits on key space or storage capacity
- Perfect for data at scale

### Unstructured Data

- Raw data without predefined schema
- Large files: images, videos, machine learning datasets
- Data without complex relationships

### Examples of Use Cases

- Static website hosting
- Backup storage
- Big data and machine learning datasets
- Log file storage
- Document storage
- Media files

## Benefits of S3 as a Managed Service

### High Availability

- **99.999999999% (11 nines) durability**: Your data won't be lost
- **Automatic replication**: Across data centers and regions
- **Always available**: AWS handles all infrastructure management

### Scalability and Cost Efficiency

- **Pay for what you use**: No upfront costs or reserved capacity
- **Serverless storage**: No servers to manage or maintain
- **Infinite scalability**: Add as much data as needed

### Easy Data Access

- **HTTP-based API**: Simple network calls for all operations
- **No proprietary formats**: Easy to export and migrate data
- **Multiple access methods**: Web console, CLI, SDKs

## S3 History and Adoption

Amazon S3 was one of the first services AWS created and has become the de facto standard for object storage. Every major cloud provider now offers S3-compatible APIs, making it a universal standard.

### Common Use Cases in AWS

- **Elastic Container Registry (ECR)**: Built on top of S3 for Docker images
- **Static website hosting**: Serve HTML, CSS, JavaScript files
- **Backup storage**: Personal and enterprise backups
- **Content delivery**: Integration with CloudFront CDN

## S3 Pricing

S3 uses on-demand pricing - you pay only for what you use.

### Storage Costs

- **Standard tier**: ~$0.02 per GB per month (50GB = $1/month)
- **Glacier tier**: ~$0.001 per GB per month (50GB = $0.05/month)

### Storage Tiers

Different tiers offer different access patterns:

- **Immediate access**: Higher cost, instant retrieval
- **Archive storage**: Lower cost, 12-hour retrieval window

### Data Transfer

- **Free**: Data movement between AWS services
- **Charged**: External uploads and downloads
- **Free tier**: 5GB per month for new users

## S3 Design and Architecture

### Hash Table in the Cloud

S3 functions like a distributed hash table with extremely fast lookups. The key structure follows URL-like patterns:

```text
s3://bucket-name/key-name
s3://photography/2022/march/photo.png
```

### Object Specifications

- **Size range**: 0 bytes to 5 terabytes
- **Unlimited objects**: No limit on number of objects per bucket
- **Automatic replication**: Invisible to users, ensures durability

### Consistency Model

- **Historical challenge**: Eventual consistency (old S3 behavior)
- **Current state**: Strong consistency (since 2020)
- **Atomic operations**: All operations on keys are transactional
- **No performance impact**: Strong consistency with negligible performance cost

## Working with S3

### Objects and Metadata

- **Object data**: The actual file or blob content
- **System metadata**: Date, size, content type (automatically generated)
- **User metadata**: Custom key-value pairs (prefix with `x-amz-meta-`)

### Optional Features

- **Versioning**: Keep multiple versions of objects (disabled by default)
- **Encryption**: Encrypt data at rest (disabled by default)

## Creating and Configuring S3 Buckets

### Bucket Creation Requirements

- **Globally unique name**: Must be unique across all AWS accounts in the region
- **Region selection**: Choose appropriate geographic location
- **Naming conventions**: No spaces, no uppercase letters, follow DNS naming rules

### Configuration Options

#### Public vs Private Access

- **Default**: Private (recommended for security)
- **Public option**: Available for static website hosting
- **Security**: AWS makes it difficult to accidentally expose private data

#### Versioning

- **Purpose**: Keep historical versions of objects
- **Use case**: When you need to track changes over time

#### Encryption

- **At-rest encryption**: Protect sensitive data in storage
- **Use cases**: Medical records, financial data, personal information

## Static Website Hosting

S3 can serve as a web server for static content:

### Setup Requirements

1. **Remove public access blocks**: Allow public read access
2. **Enable static website hosting**: Configure index and error pages
3. **Set bucket policy**: Allow public `GetObject` operations

### Limitations and Solutions

- **HTTP only**: S3 doesn't provide HTTPS
- **CloudFront integration**: Use AWS CDN for HTTPS and global distribution
- **Performance benefits**: Edge caching for faster global access

### Example Configuration

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## Command Line Interface (CLI)

The AWS CLI provides powerful tools for S3 operations:

### Common Commands

```bash
# List bucket contents
aws s3 ls s3://my-bucket

# Copy file to bucket
aws s3 cp file.txt s3://my-bucket/file.txt

# Sync directory to bucket
aws s3 sync ./website s3://my-bucket
```

### Use Cases

- **Automated backups**: Cron jobs for regular data backup
- **Deployment scripts**: Automated website deployment
- **Data migration**: Moving large datasets to cloud storage

## JavaScript SDK Integration

For our microservice development, we'll use the AWS SDK for JavaScript (v3).

### Installation and Setup

```bash
npm install @aws-sdk/client-s3
```

### SDK Architecture

The AWS SDK follows a consistent pattern across all services:

- **Client**: Manages connections and authentication
- **Commands**: Encapsulate specific operations
- **Network-based**: All operations are HTTP requests under the hood

### Basic Client Configuration

```javascript
const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    // Authentication details
  },
  forcePathStyle: true, // Use path-style URLs
});
```

## S3 Operations with JavaScript

### Putting Objects

```javascript
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const putCommand = new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'data.html',
  ContentType: 'text/html',
  Body: Buffer.from('<html><body>Hello World</body></html>'),
});

try {
  const response = await s3Client.send(putCommand);
  console.log('Upload successful');
} catch (error) {
  console.error('Upload failed:', error);
}
```

### Getting Objects

```javascript
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const getCommand = new GetObjectCommand({
  Bucket: 'my-bucket',
  Key: 'data.html',
});

try {
  const response = await s3Client.send(getCommand);
  // response.Body is a stream
  const buffer = await streamToBuffer(response.Body);
} catch (error) {
  console.error('Download failed:', error);
}
```

## Working with Streams

### Understanding Data Types

- **Buffer**: Array of bytes containing all data
- **Promise<Buffer>**: Future buffer (IOU for data)
- **Stream**: Continuous flow of data in chunks

### Why Streams Matter

- **Large data handling**: Efficient for files larger than available memory
- **Performance**: Process data as it arrives, don't wait for complete download
- **Memory efficiency**: Never hold entire large files in memory

### Stream Events

Streams implement the EventEmitter pattern with three key events:

```javascript
stream.on('data', (chunk) => {
  // Process each chunk of data
});

stream.on('end', () => {
  // Stream is complete
});

stream.on('error', (error) => {
  // Handle errors
});
```

### Converting Streams to Buffers

```javascript
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}
```

### Advanced: Stream Pipelines

For maximum efficiency, you can pipe streams directly:

```javascript
const { pipeline } = require('stream');

// Pipe S3 data directly to HTTP response
pipeline(
  response.Body, // S3 stream
  res, // Express response
  (error) => {
    if (error) {
      next(error);
    }
  }
);
```

This approach never loads the entire file into memory, making it perfect for large files like images or videos.

### Deleting Objects

```javascript
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const deleteCommand = new DeleteObjectCommand({
  Bucket: 'my-bucket',
  Key: 'data.html',
});

try {
  await s3Client.send(deleteCommand);
  console.log('Delete successful');
} catch (error) {
  console.error('Delete failed:', error);
}
```

## Best Practices and Considerations

### Error Handling

All S3 operations are network-based and can fail. Always wrap operations in try-catch blocks and implement appropriate error handling.

### Performance Optimization

- Use streams for large files
- Implement proper retry logic
- Consider using pipelines for data transformation

### Security

- Keep buckets private by default
- Use IAM roles and policies for access control
- Enable encryption for sensitive data
- Regularly audit bucket permissions

## Next Steps

In the upcoming lab, you'll implement S3 integration for the Fragments microservice. We'll also explore:

- Local S3 development with Docker Compose
- Signed URLs for secure access
- Advanced S3 features and configurations

This foundation in object storage and S3 will be crucial for building scalable, cloud-native applications.
