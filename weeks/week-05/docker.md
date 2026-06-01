# Week 5: Introduction to Containers and Docker

## Lecture

<https://www.youtube.com/watch?v=o8qcrGIg758>

## Overview

We are beginning approximately a month-long focus on containers and the technologies surrounding them. This will involve learning different programming concepts, numerous commands, and various ideas. Today's goal is to provide the background necessary to understand what Docker is and how it works.

## Understanding Application Deployment Models

### Bare Metal Deployment

Historically, running an application or server meant running it directly on a machine, often referred to as "bare metal." This approach involves:

- Installing and managing the operating system directly
- Installing application source code, binaries, libraries, and runtime directly on the server
- Having 100% access to all machine resources
- Typically running one application per server (though multiple applications are possible)
- Being the sole tenant of the server

This model can be compared to owning a house where you have complete access and control.

### Virtual Machine Deployment

Virtual machines solved many problems associated with bare metal deployment by introducing a hypervisor layer on top of the operating system. This hypervisor virtualizes hardware and resources, allowing multiple operating systems to run simultaneously on the same machine.

EC2 instances exemplify this model - when using on-demand instances, you receive specific resource allocations (virtual CPUs, RAM, storage) within a virtualized environment. This creates an "apartment building" model where one server supports multiple tenants, each with their own virtualized operating system.

### Container Deployment

Containers represent an even lighter-weight approach, focusing on running isolated processes rather than entire operating systems. The key goals of containers are to create:

- **Reproducible environments**: Ability to recreate exact conditions for running applications
- **Isolated environments**: Processes that cannot interfere with each other
- **Portable environments**: Applications that run identically across different infrastructure (laptop, AWS, Azure, CI/CD pipelines)

## Virtual Machines vs. Containers

### Virtual Machine Architecture

- Hardware layer at the bottom
- Hypervisor layer managing virtual machines
- Multiple guest operating systems (Linux, Windows, etc.)
- Each VM completely isolated with its own OS
- Applications and dependencies installed within each VM
- Overhead of running multiple operating systems

### Container Architecture

- Base infrastructure (server or laptop)
- Single host operating system (typically Linux)
- Container engine layer (similar to hypervisor but lighter)
- Multiple isolated application stacks sharing the host OS
- No guest operating systems required
- Faster startup times and lower resource consumption
- Focus on running single processes or applications

## Programs vs. Processes

Understanding the distinction between programs and processes is crucial for working with Docker:

### Programs

- Series of data on disk that can be loaded
- Files ready to be executed by the operating system
- Examples: Node.js applications, executables, scripts
- Static until loaded into memory

### Processes

- Programs loaded into memory and executed by the kernel
- Require operating system kernel to provide resources
- Need access to system calls for file operations, networking, memory allocation
- Can be viewed using the `ps` command on Unix systems
- Dynamic and consuming system resources

## Linux Features Enabling Docker

Docker leverages several Linux kernel features that have existed for decades:

### 1. chroot (1980s)

- Changes the root directory for a process
- Creates a "jail" limiting file system access
- Process can only access files within the designated root
- Provides file system isolation

### 2. Union File Systems

- Allows stacking multiple file systems
- Creates layered approach where upper layers can override lower layers
- Enables combining different components (application code + runtime)
- Critical for Docker's layered architecture
- Example: Combining a Node.js application layer with a Node.js runtime layer

### 3. Namespaces (Early 2000s)

- Provides process isolation and partitioning
- Each process receives limited subset of system resources
- Process believes it has exclusive access to the machine
- Kernel maintains strict control over actual resource access

### 4. Control Groups (cgroups) (2007)

- Limits the amount of resources processes can consume
- Controls CPU, memory, I/O usage
- Enables fine-grained resource management
- Allows pausing and resuming processes
- Prevents runaway processes from consuming all system resources

### 5. Secure Computing with Filters (seccomp) (2005)

- Restricts which system calls a process can make
- Limits API access to kernel functions
- Provides additional security by blocking access to certain kernel features

## Docker Architecture Overview

Docker combines these Linux features to create a comprehensive container platform. The key insight is that Docker is essentially "several Linux features in a trench coat" - it cleverly orchestrates existing kernel capabilities to achieve its goals.

### Why Linux is Essential

Docker requires a Linux kernel to function because it depends on these Linux-specific features. For Windows and Mac users:

- Docker Desktop runs a specialized Linux virtual machine
- This creates some performance overhead during development
- Production deployments typically run on native Linux systems
- The development overhead is eliminated when deploying to Linux-based cloud infrastructure

## Docker Components

Docker includes numerous components, all confusingly named "Docker":

- **Docker Desktop**: Entry point application for Windows/Mac
- **Docker Engine**: Core runtime and daemon
- **Docker CLI**: Command-line interface
- **Docker Compose**: Multi-container orchestration tool
- **Docker Registry**: Storage for Docker images
- **Docker Images**: Templates for creating containers
- **Docker Containers**: Running instances of images

### Docker Desktop

For Windows and Mac users, Docker Desktop provides:

- Docker Engine management
- Docker CLI tools
- Docker Compose
- Virtual machine management for Linux kernel access
- Graphical interface for managing Docker resources

### Docker Engine

The Docker Engine consists of:

- **Docker daemon (dockerd)**: Background service managing Docker objects
- **REST API**: Interface for controlling the daemon
- **Client tools**: Command-line and graphical interfaces

The architecture mirrors microservice design - Docker daemon is essentially a microservice for managing containers and images, controlled via REST API calls.

## Docker Objects

### Docker Files

- Source code files containing build instructions
- Text files with specific syntax
- Stored in version control (Git)
- Define steps to create Docker images

### Docker Images

- Templates for creating containers
- Read-only and immutable
- Built from Docker files
- Stored in registries (not version control)
- Composed of layers that can be shared and reused

### Docker Containers

- Running instances of Docker images
- Managed through start, stop, and interaction commands
- Ephemeral and stateful during execution

## Docker Workflow

The typical Docker workflow follows this pattern:

1. **Write Dockerfile**: Create instructions for building image
2. **Build Image**: Use `docker build` to create image from Dockerfile
3. **Push to Registry**: Use `docker push` to upload image to registry
4. **Pull and Run**: Use `docker pull` and `docker run` to create containers

### Registries

Docker images are stored in registries:

- **Docker Hub**: Public registry with open-source images
- **Amazon ECR**: Private registry service
- **Private registries**: Self-hosted options for complete control
- **Public vs. Private**: Choose based on sharing and security requirements

## Practical Example

Let's walk through creating a simple Docker container:

### 1. Create Application

```javascript
// index.js
console.log('Hello Docker');
```

### 2. Create Dockerfile

```dockerfile
# Use Node.js as base image
FROM node

# Copy source code into image
COPY index.js .

# Define command to run when container starts
CMD ["node", "index.js"]
```

### 3. Build Image

```bash
docker build -t humphd/hello-docker .
```

### 4. Push to Registry

```bash
docker push humphd/hello-docker
```

This creates a complete, portable application package that can run identically across different environments.

## Key Concepts Summary

- **Containers provide lightweight isolation** compared to virtual machines
- **Linux kernel features enable** Docker's functionality
- **Docker orchestrates existing technologies** rather than inventing new ones
- **Images are immutable templates**, containers are running instances
- **Registries store and distribute images** like package managers
- **Dockerfile → Image → Container** represents the development workflow

Understanding these foundational concepts prepares you for the deeper dive into Docker commands, best practices, and advanced container orchestration in the coming weeks.
