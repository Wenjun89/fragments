# Writing Dockerfiles from Scratch: Dockerizing a Web App

## Lecture

<https://www.youtube.com/watch?v=Kf1nf-8Vdcw>

## Introduction

In this lecture, we'll walk through the process of creating Dockerfiles from scratch by Dockerizing a front-end web application. We'll explore two different approaches: using Node.js and using Nginx as the base image.

## Setting Up the Docker Environment

Before we begin writing our Dockerfile, we need to create two essential files:

### 1. Creating a .dockerignore File

The `.dockerignore` file tells Docker which files and directories to exclude from the build context. For our front-end application, we should ignore:

```dockerignore
.parcel-cache/
.vscode/
dist/
node_modules/
```

**Why ignore these directories?**

- `.parcel-cache/` - Build cache specific to the development environment
- `.vscode/` - IDE configuration only needed for development
- `dist/` - We'll build a fresh version inside the container
- `node_modules/` - Platform-specific dependencies that should be installed fresh

## Approach 1: Node.js-Based Dockerfile

### Basic Structure

Let's start with a basic Dockerfile using Node.js as the base image:

```dockerfile
# Build the fragments UI web app and serve it via parcel
FROM node:24-bullseye

# Metadata
LABEL maintainer="your-email@example.com" \
      description="Fragments UI web app for testing"

# Environment variables
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Default command to serve the app
CMD ["npm", "run", "serve"]

# Expose the port
EXPOSE 1234
```

### Key Concepts Explained

**Base Image Selection**: We use `node:24-bullseye` instead of just `node` to:

- Pin to a specific Node.js version for consistency
- Use the Bullseye version of Debian for compatibility with modern dependencies

**Layer Optimization**: We copy `package*.json` files first, then run `npm ci`, and finally copy the rest of the source code. This allows Docker to cache the dependency installation layer separately from the source code layer.

**Build Process**:

1. Copy package files
2. Install dependencies (`npm ci` for clean, reproducible installs)
3. Copy source code
4. Build the application
5. Set the default command to serve the app

### Running the Container

To build and run this container:

```bash
# Build the image
docker build -t example-one .

# Run with port mapping
docker run --rm -p 1234:1234 example-one
```

## Approach 2: Nginx-Based Dockerfile

For production deployments, it's often better to use a dedicated web server like Nginx to serve static files.

### Installing Node.js in an Nginx Container

Since Nginx doesn't include Node.js, we need to install it manually:

```dockerfile
# Use Nginx as base image
FROM nginx:1.22.0-stable

# Install Node.js and build tools
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get update && \
    apt-get install -y \
        build-essential \
        nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/local/src/fragments-ui

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Copy built files to Nginx directory
RUN cp -a dist/. /usr/share/nginx/html/

# Expose port 80 (Nginx default)
EXPOSE 80
```

> [!NOTE]
> The way we're combining nginx and node.js in a single image isn't optimal, since our final image will be larger than it needs to be (i.e., we only need node.js during the build, not at runtime). In later weeks we'll learn how to use multi-stage Dockerfiles to separate build- and run-time dependencies and reduce image size.

### Key Differences from Node.js Approach

**Web Server**: Nginx is a production-grade web server optimized for serving static files, whereas the Node.js approach uses Parcel's development server.

**Port**: Nginx runs on port 80 by default, not port 1234.

**File Location**: Static files must be copied to `/usr/share/nginx/html/` where Nginx expects them.

**Default Command**: We don't need to specify a CMD because Nginx's base image already defines the command to start the web server.

### Running the Nginx Container

```bash
# Build the image
docker build -t example-two .

# Run with port mapping
docker run --rm -p 80:80 example-two
```

## Best Practices Demonstrated

### 1. Layer Caching Strategy

By copying package files first and installing dependencies before copying source code, we ensure that dependency installation is cached separately. This means that changes to source code won't force a complete reinstall of dependencies.

### 2. Specific Base Image Versions

Always pin to specific versions (like `node:24-bullseye`) rather than using generic tags like `node:latest` to ensure reproducible builds.

### 3. Environment Configuration

Set appropriate environment variables for the container environment, such as disabling npm color output which doesn't display well in container logs.

### 4. Proper Working Directory

Use `WORKDIR` to set a consistent location for your application files within the container.

## Troubleshooting Common Issues

### Version Compatibility Problems

If you encounter errors like "glibc version not found," you may need to use a different base image variant. For example, switching from the default Debian version to `bullseye` can resolve compatibility issues with newer dependencies.

### Port Exposure vs. Publishing

Remember that `EXPOSE` in the Dockerfile only documents which port the container uses. You must use the `-p` flag when running the container to actually publish the port to the host.

## Next Steps

In upcoming lectures, we'll explore:

- Multi-stage builds for more efficient images
- Advanced optimization techniques
- Security best practices for production containers
- Container orchestration and deployment strategies

This foundation gives you the essential skills to containerize web applications using Docker, whether for development or production environments.
