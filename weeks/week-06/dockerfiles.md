# Week 6: Authoring Docker Files

## Lecture

<https://www.youtube.com/watch?v=rnCKjgGsQVo>

## Overview

This week focuses on authoring Docker files and understanding the fundamentals of building Docker images. We will cover:

- How the Docker build process works
- Understanding build context
- Docker file syntax and instructions
- Building and running Docker containers
- Dockerizing applications (creating reusable environments)

## Docker Build Context

### Understanding the Docker Engine Architecture

The Docker engine consists of several components:

- **Host machine** running the Docker engine
- **Management layer** with the `dockerd` server
- **REST API** for communication (e.g., POST to `/images/build`)
- **Client interfaces** (command line, GUI tools, VS Code extension)

### What is Build Context?

When you perform a Docker build, the Docker engine requires two essential components:

1. **Docker file** - A set of instructions for creating the image
2. **Build context** - The file tree that gets copied into the Docker engine

The build context includes:

- The directory where your Docker file is located
- All subdirectories and files beneath that directory
- Everything gets copied into the Docker engine for the build process

### Managing Build Context Size

Build context size significantly affects your final image size. Consider a typical Node.js application structure:

```text
app/
├── package.json
├── package-lock.json
├── README.md
├── .eslintrc.js
├── node_modules/     # Often 1GB+ in size
├── .git/            # Second largest folder
├── src/             # Your source code
└── tests/           # Your test files
```

**Important considerations:**

- **node_modules**: Architecture and OS-specific, should be regenerated in the target environment
- **.git**: Contains entire project history, unnecessary for deployment
- **Source files**: Necessary but can be large

### Docker Ignore Files

Use `.dockerignore` files to exclude unnecessary files from the build context:

```dockerignore
node_modules/
.git/
*.env
!.env.test
```

The syntax works similarly to `.gitignore`:

- Use trailing slashes for directories
- Use `!` to include exceptions to ignore rules

## Docker File Fundamentals

### Basic Structure

Docker files are:

- Plain text files meant for version control
- Typically named `Dockerfile` (capital D, no extension), though you can name them anything
- Typically placed in the project root (e.g., beside `package.json`)
- Executed line by line, each creating a **layer**
- Aggressively cached for performance

### Comments and Formatting

```dockerfile
# This is a comment
# Blank lines are ignored and help with readability

# Use trailing backslashes for line continuation
RUN cd /app \
    && npm install
```

**Best practices:**

- Write extensive comments
- Use vertical whitespace for readability
- Group related instructions visually

## Docker File Instructions

### FROM - Base Image Selection

Every Docker file must start with a `FROM` instruction:

```dockerfile
FROM node
FROM node:24
FROM node:24-alpine
FROM scratch
```

**Considerations when choosing base images:**

- **Architecture**: ARM64 vs AMD64
- **Version specificity**: Avoid `latest` in production
- **Operating system**: Different Linux distributions (bullseye, buster, alpine)
- **Reproducibility**: Pin specific versions for consistent builds

### LABEL - Metadata

Add metadata to your images:

```dockerfile
LABEL description="My application" \
      version="1.0.0" \
      maintainer="your-email@example.com"
```

### ARG vs ENV - Variables

**Build Arguments (ARG):**

- Used during build time only (not available at runtime)
- Not stored in the final image
- Can be overridden with `--build-arg`

```dockerfile
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}
```

**Environment Variables (ENV):**

- Available at runtime
- Stored in the final image
- Can be overridden with `-e` or `--env`

```dockerfile
ENV PORT=8080
ENV NODE_ENV=production
```

### WORKDIR - Working Directory

Sets the working directory inside the image:

```dockerfile
WORKDIR /app
```

- Creates the directory if it doesn't exist
- Allows use of relative paths in subsequent instructions
- Common to use `/app` or similar top-level directories

### COPY - File Transfer

Copies files from build context to image:

```dockerfile
COPY package.json ./
COPY src/ ./src/
COPY . .
```

**Important notes:**

- Use trailing slashes to indicate directories
- Paths are relative to the WORKDIR
- Only copies from build context, not arbitrary file system locations

### RUN - Execute Commands

Executes commands during the build process:

```dockerfile
RUN npm install
RUN apt-get update \
    && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*
```

**Best practices:**

- Combine related commands to reduce layers
- Clean up after installations to reduce image size
- Use `&&` to chain commands in a single layer

### CMD - Default Command

Specifies the default command when running the container:

```dockerfile
CMD ["node", "server.js"]
CMD ["python", "app.py"]
CMD ["redis-server"]
```

### EXPOSE - Port Documentation

Documents which ports the application uses:

```dockerfile
EXPOSE 8080
EXPOSE 3000 3001
```

**Note:** This is primarily documentation; actual port publishing happens at runtime with `-p` flag.

## Building and Running Images

### Docker Build Command

```bash
# Basic build
docker build .

# Build with tag
docker build -t myapp .

# Build with specific Dockerfile
docker build -f Dockerfile.dev .

# Build with build arguments
docker build --build-arg NODE_VERSION=18 -t myapp .

# Multiple tags
docker build -t myapp:latest -t myapp:1.0.0 .
```

### Docker Run Command

```bash
# Basic run
docker run myapp

# Run with environment variables
docker run -e PORT=3000 myapp
docker run --env-file .env myapp

# Run with port mapping
docker run -p 8080:3000 myapp

# Override default command
docker run myapp echo "Hello World"
```

## Best Practices Summary

1. **Use specific base image versions** for reproducibility
2. **Optimize build context** with `.dockerignore`
3. **Write comprehensive comments** for maintainability
4. **Combine RUN commands** to reduce layers
5. **Use WORKDIR** for cleaner file organization
6. **Pin dependency versions** for consistent builds
7. **Clean up after installations** to reduce image size
8. **Use multi-stage builds** for production optimization (covered next week)

## Tools and Resources

- **Docker Hub**: Browse official images and their Dockerfiles
- **Explain Shell**: Understand complex shell commands used in RUN instructions
- **VS Code Docker Extension**: GUI tools for Docker management
- **Official Docker Documentation**: Comprehensive reference for all instructions

The next session will include hands-on examples of writing Dockerfiles for real applications, including the fragments microservice.
