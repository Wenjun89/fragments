# Docker Compose Tutorial

## Lecture

<https://www.youtube.com/watch?v=R5WHROPpTws>

## Introduction

In this tutorial, we'll explore Docker Compose by setting up multiple services including a fragments microservice backend, frontend, and various supporting services. Docker Compose allows us to define and run multi-container Docker applications with a single configuration file.

## Key Resources

Before diving in, keep the [Docker Compose YAML syntax reference](https://docs.docker.com/compose/compose-file/) open in a tab. This comprehensive documentation contains examples for everything you'll need to configure in your Docker Compose files.

## Setting Up the Basic Services

### Initial Docker Compose Structure

We'll start with a basic `docker-compose.yaml` file containing two services:

```yaml
services:
  # Fragments back-end API
  fragments:
    # Configuration will go here

  # Fragments front-end UI web app
  fragments-ui:
    # Configuration will go here
```

### Configuring the Backend Service

For the fragments backend service, we need to specify how to build the image and configure runtime settings:

```yaml
fragments:
  build:
    context: ./fragments
    args:
      - ARCH=arm64 # For Apple Silicon Macs
  environment:
    - FRAGMENTS_LOG_LEVEL=${FRAGMENTS_LOG_LEVEL:-debug}
    - PORT=8080
    - HTPASSWD_FILE=test.htpasswd
  ports:
    - '8080:8080'
  restart: always
```

**Key Points:**

- **Build Context**: Points to the directory containing the Dockerfile
- **Build Arguments**: Pass build-time variables (different from runtime environment variables)
- **Environment Variables**: Can reference host environment variables with fallback values
- **Port Mapping**: Format is `host:container`
- **Restart Policy**: Automatically restart containers if they crash

### Configuring the Frontend Service

The frontend service requires build-time arguments for configuration:

```yaml
fragments-ui:
  build:
    context: ./fragments-ui
    args:
      - API_URL=http://localhost:8080
      - ARCH=arm64
  ports:
    - '8081:80'
```

## Adding an Nginx Reverse Proxy

A common production pattern is to use Nginx as a reverse proxy in front of your services:

```yaml
proxy:
  image: nginx:stable-alpine
  container_name: proxy
  ports:
    - '80:80'
  volumes:
    - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - fragments
```

### Nginx Configuration

The nginx configuration file (`nginx-proxy.conf`) sets up routing and caching:

```nginx
server {
    listen 80;
    server_name localhost;

    # Cache configuration
    proxy_cache_path /tmp/nginx-cache levels=1:2 keys_zone=my_cache:10m;

    location / {
        proxy_pass http://fragments:8080;
        proxy_cache my_cache;
    }
}
```

**Important**: Use service names (like `fragments`) instead of `localhost` for inter-container communication. Docker's DNS automatically resolves service names to container IP addresses.

## Adding AWS Mock Services

### MiniStack for S3

MiniStack provides local implementations of AWS services:

```yaml
s3:
  image: ministackorg/ministack
  container_name: ministack
  ports:
    - '4566:4566'
  environment:
    - SERVICES=s3
    - MINISTACK_REGION=us-east-1
    - AWS_ACCESS_KEY_ID=test
    - AWS_SECRET_ACCESS_KEY=test
```

### DynamoDB Local

Amazon's official local DynamoDB implementation:

```yaml
dynamodb:
  image: amazon/dynamodb-local
  container_name: dynamodb
  ports:
    - '8000:8000'
  environment:
    - AWS_ACCESS_KEY_ID=test
    - AWS_SECRET_ACCESS_KEY=test
```

## Docker Compose Commands

### Basic Operations

- **Start all services**: `docker compose up`
- **Start in background**: `docker compose up -d`
- **Force rebuild**: `docker compose up --build`
- **Stop and remove**: `docker compose down`

### Selective Service Management

- **Start specific services**: `docker compose up fragments proxy`
- **View logs**: `docker logs <container-name>`
- **Check running containers**: `docker ps`

### Service Dependencies

Use the `depends_on` directive to ensure services start in the correct order:

```yaml
proxy:
  # ... other configuration
  depends_on:
    - fragments
```

When you start the proxy service, Docker Compose will automatically start the fragments service first.

## Environment Variable Management

Docker Compose supports flexible environment variable handling:

```yaml
environment:
  - FRAGMENTS_LOG_LEVEL=${FRAGMENTS_LOG_LEVEL:-debug} # Use host variable or default to 'debug'
  - PORT=8080 # Fixed value
  - API_URL # Forward host variable as-is
```

## Best Practices

1. **Use specific image tags** rather than `latest` for production deployments
2. **Name your containers** for easier debugging and log access
3. **Use Alpine-based images** when possible for smaller size
4. **Separate build-time and runtime configuration** appropriately
5. **Keep the Docker Compose reference documentation** handy while developing

## Benefits of Docker Compose

Docker Compose provides significant advantages for development teams:

- **Single command deployment**: Start entire application stack with one command
- **Consistent environments**: Same configuration across all developers
- **Service orchestration**: Automatic networking and dependency management
- **Easy scaling**: Simple to add or modify services
- **Development efficiency**: Quick iteration and testing of multi-service applications

This approach allows development teams to focus on building features rather than managing complex deployment configurations.
