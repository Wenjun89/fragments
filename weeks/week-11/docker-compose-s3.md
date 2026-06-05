# S3 and Object Storage: Advanced Concepts and Local Development

## Lecture

<https://www.youtube.com/watch?v=IDHXynaMDys>

## Introduction

This week we are exploring S3 (Simple Storage Service) and its broader ecosystem. S3 has become the de facto standard for cloud object storage, with its API being adopted by hundreds of companies worldwide.

## S3-Compatible Services

### The Ubiquity of S3 API

S3's success has led to widespread adoption of its API across different cloud providers:

- **Cloudflare R2**: An S3-compatible object storage service
- **Backblaze**: Provides S3-compatible API for their storage platform
- **DigitalOcean Spaces**: Another S3-compatible object storage service

The key advantage is that any code written for AWS S3 will work seamlessly with these alternative providers. This demonstrates the power and standardization that S3 has brought to the object storage market.

## Local Development with MiniStack

### Setting Up MiniStack with Docker Compose

For local development and testing, we can use MiniStack, which provides an S3-compatible API that runs locally. This is particularly useful when you want to:

- Develop offline
- Avoid AWS charges during development
- Have complete control over your testing environment

### Docker Compose Configuration

Here's how to set up a complete development environment with Docker Compose:

```yaml
services:
  fragments:
    depends_on:
      - ministack
      - dynamodb-local
    init: true
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILDPLATFORM=linux/arm64 # For Apple Silicon Macs
    environment:
      - API_URL=http://localhost:8080
      - HTPASSWD_FILE=tests/.htpasswd
      - FRAGMENTS_LOG_LEVEL=debug
      - AWS_ACCESS_KEY_ID=root
      - AWS_SECRET_ACCESS_KEY=password
      - AWS_DEFAULT_REGION=us-east-1
      - AWS_S3_ENDPOINT_URL=http://ministack:4566
      - AWS_DYNAMODB_ENDPOINT_URL=http://dynamodb-local:8000

  ministack:
    image: ministackorg/ministack
    ports:
      - '4566:4566'
    environment:
      - MINISTACK_REGION=us-east-1
      - SERVICES=s3

  dynamodb-local:
    image: amazon/dynamodb-local
    ports:
      - '8000:8000'
    command: ['-jar', 'DynamoDBLocal.jar', '-inMemory', '-sharedDb']
```

### Key Configuration Points

1. **Service Dependencies**: The fragments service depends on both MiniStack and DynamoDB Local
2. **Credentials**: Using simple credentials (root/password) for development
3. **Endpoint URLs**: Override default AWS endpoints to point to local containers

## Pre-signed URLs: Advanced S3 Feature

### Concept and Benefits

Pre-signed URLs are a powerful S3 feature that allows temporary, secure access to objects without requiring AWS credentials. This architecture pattern offers several advantages:

- **Scalability**: Clients can upload/download directly to S3, bypassing your server
- **Security**: URLs are time-limited and cryptographically signed
- **Performance**: Reduces load on your application servers
- **Cost**: Reduces bandwidth costs for your infrastructure

### Implementation Example

```javascript
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

async function getFragmentShareUrl(fragment, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: 'fragments',
    Key: `${fragment.ownerId}/${fragment.id}`,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresIn, // URL expires in seconds
  });

  return signedUrl;
}
```

### API Route for Sharing

```javascript
// GET /v1/fragments/:id/share
router.get('/fragments/:id/share', async (req, res) => {
  try {
    const user = req.user;
    const fragmentId = req.params.id;

    const fragment = await Fragment.byId(user, fragmentId);
    const shareUrl = await getFragmentShareUrl(fragment);

    res.json({ url: shareUrl });
  } catch (error) {
    res.status(404).json({ error: 'Fragment not found' });
  }
});
```

## Testing with HURL

### Complete Workflow Test

```hurl
# Step 1: Create a fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain

If you can see this, you've got S3 signed URLs working!

HTTP/1.1 201
[Captures]
location: header "Location"

# Step 2: Get a pre-signed URL for sharing
GET {{location}}/share
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
jsonpath "$.url" startsWith "http://ministack:4566/fragments"
```

## Practical Considerations

### Security Best Practices

1. **Short Expiration Times**: Keep pre-signed URLs valid for the minimum time necessary
2. **Specific Operations**: Only grant the specific permissions needed (GET, PUT, etc.)
3. **Domain Restrictions**: Consider implementing additional domain-based restrictions

### Development vs Production

- **Development**: Use MiniStack with simple credentials and local storage
- **Production**: Use AWS S3 with proper IAM roles and security policies
- **Testing**: Both environments should use the same S3 client code

### Container Networking

When working with Docker Compose:

- Use container names for inter-service communication (`http://ministack:4566`)
- Use `localhost` for external access (`http://localhost:4566`)
- Understand that DNS resolution works differently inside containers

## Conclusion

S3's API standardization has created a rich ecosystem of compatible services. By using tools like MiniStack for local development and understanding advanced features like pre-signed URLs, you can build scalable, secure applications that work seamlessly across different storage providers. The key is to write code against the S3 API standard, which ensures portability and flexibility in your deployment options.
