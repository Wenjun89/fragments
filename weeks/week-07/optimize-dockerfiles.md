# Week 7: Optimizing Dockerfiles

## Lecture

<https://www.youtube.com/watch?v=X5IoVNsfJ0Q>

## Introduction

Today we will be discussing Dockerfiles and specifically how to make more optimized Dockerfiles and Docker images. We have been looking at how to author Dockerfiles and how to create them so they work. This week we will focus on how to make them smaller, more secure, and more efficient. We will explore the best practices for writing these files.

This week you also have Lab 6, which is all about starting to work with Docker registries. We will be working with Docker Hub this week, and later we will work with Amazon's container registry, the Elastic Container Registry (ECR). You will get a chance to work with a couple of different container registries for publishing your images that you will be building.

In the second lecture this week, I will do a case study on an optimal way to Dockerize a web app. Also, you should start thinking about Assignment 2. You have completed Assignment 1 and we need to keep progressing forward with the features that we want to ship. Many of the things that you need to do in Assignment 2 relate to working with Docker. This is a good week for you to focus on getting your Docker files for the Fragments backend and the frontend in good shape, making them as efficient as possible, and using all the best practices we will discuss this week.

## 10 Ways to Optimize Docker Files

### 1. Use the Smallest Possible Linux Distribution

The first thing you need to think about is size. The first Docker file we made was for a simple hello world style Node app, and it came in at a gigabyte of size for all the node modules, the runtime, the operating system, and everything else. That is a lot. When thinking about cloud costs, one of your costs will be storage. When you are storing all these images, publishing them, keeping lots of versions in the past, and downloading things, the bigger they are, the more they will cost you and the slower they will be.

#### Alpine Linux

One way to make things smaller is to start with the smallest possible Linux distribution available to us. While you could use something like Ubuntu or Debian, these distributions are big because they include all kinds of things that you do not necessarily need when running a Docker container. We are not trying to make an operating system work as our desktop environment. We do not need word processors, services, tools we are not using, libraries we will never include, and documentation we will never read.

Alpine Linux is a really stripped down version of Linux. You have a Linux kernel and just enough of the parts of a Linux distribution that you need to run your application. Alpine is somewhere around five megabytes in size. When looking at Docker Hub, you will see that people include different tags that have Alpine in the name, such as `14-alpine`, `16-alpine`, `18-alpine`.

#### What Makes Alpine Smaller

Alpine achieves its small size through several methods:

- **Stripped Components**: Many parts of the operating system are simply removed
- **musl libc**: Instead of glibc, Alpine uses musl libc, which provides a drop-in replacement for glibc but is much smaller and arguably faster
- **BusyBox**: Alpine uses BusyBox, which provides typical Unix utilities in a single binary

#### BusyBox

BusyBox is a way to get the typical utilities you need in a Unix environment. Instead of shipping all the separate commands (copy, grep, gzip, mkdir, ping, etc.) as individual binaries, BusyBox creates a single binary with all these different commands symlinked into it.

#### Package Management

Every Linux distribution has its own package manager. Alpine Linux uses `apk` (Alpine Package Keeper). Common commands include:

- `apk update` - Download the list of current packages
- `apk upgrade` - Upgrade your packages
- `apk search` - Search for packages
- `apk add` - Add a package
- `apk add --no-cache` - Add a package without caching (recommended for Docker)

### 2. Use Official Images

Always use official images when possible. When searching for images on Docker Hub, you will see thousands of results. Be careful not to pick software that is not being maintained. Look for:

- Official Docker image badges
- Recent update dates
- High download counts
- Active maintenance

Avoid images that were last updated years ago, as they likely contain security vulnerabilities and outdated dependencies.

### 3. Be Specific About Image Versions

Think about the specific version of an image that you use. When you specify `FROM node`, you are saying use the latest version of Node that was published. This can lead to inconsistencies between development and production environments.

#### Version Specificity Levels

1. **Generic**: `FROM node` (not recommended for production)
2. **Version Specific**: `FROM node:16.14-alpine3.14` (better)
3. **SHA Pinned**: `FROM node:16.14-alpine3.14@sha256:...` (most secure)

To get the SHA digest of an image:

```bash
docker pull node:18
# This will output a digest like: sha256:abc123...
```

Using SHA digests ensures you get the exact same image every time, preventing supply chain attacks and ensuring reproducible builds.

### 4. Optimize Layer Caching

Think about your Dockerfile as a series of layers. You want the top layer to be the least frequently changing part of your code, and as you get to the bottom, it should be the most frequently changing part of your build.

#### Layer Caching Strategy

- Base image definition (changes rarely)
- System dependencies installation
- Application dependencies (package.json, npm install)
- Source code (changes frequently)
- Runtime commands

Docker caches the results of `RUN` and `COPY` commands. When files change, Docker knows to rebuild that layer and all subsequent layers.

#### Combining Commands

Combine multiple shell commands into a single `RUN` command to take advantage of layer caching:

```dockerfile
RUN apt-get update \
    && apt-get install -y \
        package1 \
        package2 \
        package3 \
    && rm -rf /var/lib/apt/lists/*
```

### 5. Use Multi-Stage Builds

Multi-stage builds allow you to do the build in multiple stages. Often when building an image, you need tools for compilation, dependency installation, and other build processes that you do not need in the final runtime image.

#### Multi-Stage Build Structure

```dockerfile
# Stage 1: Dependencies
FROM node:16.14 AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:16.14-alpine AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

This approach allows you to:

- Use a larger image for building/compiling
- Copy only the artifacts you need to a smaller production image
- Significantly reduce final image size

### 6. Separate Development and Production Dependencies

Be aware of the difference between development and production dependencies. In a Node project, you can define different types of dependencies in your package.json file:

- **dependencies**: Runtime dependencies needed in production
- **devDependencies**: Development tools like Jest, ESLint, TypeScript compiler

#### Installation Options

1. `npm install` - Installs everything (not recommended for production)
2. `npm install --production` - Installs only production dependencies
3. `npm ci --production` - Installs exact versions from package-lock.json, production only (recommended)

#### NODE_ENV Environment Variable

Set `NODE_ENV=production` to enable production optimizations in many Node.js libraries:

```dockerfile
ENV NODE_ENV=production
```

### 7. Use Non-Root Users

Every Docker image runs as a particular user, and by default, this is usually the root user. Running as root is a security risk because if a hacker gains access to your container, they have full privileges.

#### Implementing Non-Root Users

Most official images define a non-privileged user. For Node images, this user is called `node`:

```dockerfile
# Change ownership of files
COPY --chown=node:node . /app

# Switch to non-root user
USER node

# Start application
CMD ["node", "server.js"]
```

This follows the principle of least privilege - only use the minimum permissions necessary.

### 8. Use an Init Process

Run an init process to properly handle signals and process management. The init process (PID 1) is responsible for:

- Handling signals from the kernel
- Managing child processes
- Proper shutdown procedures

#### Options for Init Processes

1. **Built-in Docker init**: `docker run --init` or `init: true` in Docker Compose
2. **Manual installation**: Install `tini` or `dumb-init`

```dockerfile
# Using entry point with tini
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
```

The built-in Docker init option is usually the simplest approach.

### 9. Define Health Checks

Define a health check command to let Docker know whether your container is healthy. A process might be running but not actually functional (e.g., unable to accept network requests).

```dockerfile
HEALTHCHECK --interval=3m --timeout=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

This health check:

- Runs every 3 minutes
- Times out after 30 seconds
- Retries 3 times before marking as unhealthy
- Uses curl to check a health endpoint

### 10. Implement All Best Practices

When writing your Dockerfile for assignments, implement all of these practices:

- ✅ Use official images
- ✅ Use specific versions with SHA digests
- ✅ Use Alpine images for production
- ✅ Install only production dependencies
- ✅ Use multi-stage builds
- ✅ Use non-root users
- ✅ Include health checks
- ✅ Use proper init processes
- ✅ Set NODE_ENV=production
- ✅ Optimize layer caching

These practices will help you achieve better security, speed, size, and efficiency in your Docker images.

## Lab 6: Docker Registries

This week's lab focuses on working with Docker registries, starting with Docker Hub and later moving to Amazon's Elastic Container Registry (ECR). You will learn how to publish and manage your Docker images in these registries.

## Assignment 2 Preparation

Start thinking about Assignment 2, which will involve significant Docker work. Use this week to get your Docker files for the Fragments backend and frontend in optimal shape, implementing all the best practices covered in this lecture.
