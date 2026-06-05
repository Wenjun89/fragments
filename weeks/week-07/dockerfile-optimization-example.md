# Dockerizing a Web Application: A Complete Example

## Lecture

<https://www.youtube.com/watch?v=0ZWKfJv7XEA>

## Introduction

In this lecture, we'll work through a comprehensive example of dockerizing a web application using best practices. We'll be working with Seneca's modernized C course notes, which use Docusaurus—a React-based documentation tool that you may recognize from popular projects like Jest.

Our goal is to create the most efficient Docker image possible using a multistage build, ultimately serving the application with NGINX while discarding unnecessary layers.

## Understanding the Application

### Project Overview

The application we're dockerizing is built with Docusaurus, the same documentation framework used by Facebook for many of their projects. The source code is available online and provides a good example of a typical Node.js-based web application.

### Build Requirements

According to the project's contributing guide, the application requires:

- An LTS version of Node.js (originally Node 14, but we'll use the current LTS version 16.15.1)
- Yarn package manager (an alternative to NPM that uses the same registry)

### Build Process

The standard build process involves:

1. `yarn install` - Install dependencies
2. `yarn start` - Run development server
3. `yarn build` - Create production build

When we run `yarn build`, it generates a `build` directory containing the compiled website with minified JavaScript, CSS, and all static assets.

## Creating the Docker Configuration

### Setting Up .dockerignore

Before creating our Dockerfile, we need to establish a comprehensive `.dockerignore` file to exclude unnecessary files from the build context:

```dockerignore
.docusaurus
.github
.husky
.vscode
build
node_modules
git*
prettier*
*.md
!LICENSE.md
```

Key exclusions:

- `.docusaurus` - Generated cache directory
- `.github` - CI/CD pipeline files
- `.husky` - Git commit hooks
- `.vscode` - Editor configuration
- `build` - We'll generate this inside Docker
- `node_modules` - We'll install platform-specific modules
- Development configuration files

## Implementing the Multistage Build

### Stage 0: Dependencies

```dockerfile
FROM node:16.15.1-bullseye@sha256:... as dependencies

ENV NODE_ENV=production
WORKDIR /site

COPY package.json yarn.lock ./
RUN yarn install
```

Key points:

- Use specific Node.js version with Bullseye for better compatibility
- Set production environment
- Copy only package files first for better caching
- Install dependencies in a separate stage

### Stage 1: Build

```dockerfile
FROM node:16.15.1-bullseye@sha256:... as build

WORKDIR /site

COPY --from=dependencies /site ./
COPY . .

RUN yarn build
```

This stage:

- Copies dependencies from the previous stage
- Copies source code
- Builds the production website

### Stage 2: Deploy

```dockerfile
FROM nginx:1.22.0-alpine@sha256:... as deploy

COPY --from=build /site/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost || exit 1
```

Final stage features:

- Uses lightweight Alpine-based NGINX
- Copies only the built website
- Includes health check for monitoring
- Exposes port 80 for web traffic

## Troubleshooting Common Issues

### Platform Compatibility

During the build process, you may encounter platform-specific issues, particularly with native modules like Sharp (used for image optimization). The solution is often to use a more recent base image with updated system libraries.

### Health Check Implementation

The health check uses curl to verify the web server is responding:

- Runs every 15 seconds
- 30-second timeout
- 10-second startup grace period
- 3 retry attempts before marking unhealthy

## Testing the Implementation

### Building the Image

```bash
docker build -t intro-to-c .
```

### Running the Container

```bash
docker run --rm -it -p 8000:80 intro-to-c
```

### Verifying Health Status

```bash
docker ps
```

The output will show the container's health status, which transitions from "starting" to "healthy" once the health checks pass.

## Benefits of This Approach

### Efficiency

- **Layer Caching**: Dependencies are cached separately from source code
- **Size Optimization**: Final image contains only the built website and NGINX
- **Build Speed**: Unchanged dependencies don't need reinstallation

### Production Readiness

- **Enterprise Web Server**: NGINX provides robust, scalable serving
- **Health Monitoring**: Built-in health checks enable automated management
- **Security**: Minimal attack surface with Alpine Linux base

### Best Practices Implementation

- **Specific Versioning**: Using SHA digests for reproducible builds
- **Stage Naming**: Clear separation of concerns across build stages
- **Environment Configuration**: Proper production environment setup

## Conclusion

This multistage Docker build demonstrates how to create an efficient, production-ready container for a web application. By separating dependency installation, building, and deployment into distinct stages, we achieve optimal caching, minimal image size, and clear separation of concerns.

The final container includes everything needed to serve the application in production: the compiled website and an enterprise-grade web server, all while excluding development dependencies and build tools that aren't needed at runtime.
