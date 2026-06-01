# Docker Containers and Images: A Technical Deep Dive

## Lecture

<https://www.youtube.com/watch?v=bnah03UZKKU>

## Introduction

This week we're exploring Docker containers and images in greater technical detail. In our previous session, we covered the 10,000-foot view of Docker, including Docker Engine, Docker clients like the Docker CLI, Docker Registries and Docker Hub, and how Docker relies on Linux kernel features for process isolation and resource allocation.

Today we'll take a more hands-on approach to working with Docker containers and learn how to create containers from images.

## Review: Our Simple Node Application

Let's begin by reviewing what we accomplished previously. We created a simple Node.js application that prints "hello Docker" and created a Dockerfile to containerize it.

### The Dockerfile Structure

Our Dockerfile contains three essential lines:

```dockerfile
FROM node
COPY index.js .
CMD ["node", "index.js"]
```

**Line 1: Base Image**
Every Dockerfile must define a base image. This creates a stack of layers where our application builds on top of the node image, which builds on top of a Linux distribution, and so on. This layered approach allows Docker to create reproducible environments that can be deployed consistently.

**Line 2: Copy Source Code**
We copy our source code into the image so that the final image contains both the Node.js runtime and our application code.

**Line 3: Default Command**
We specify what command should run when the container starts.

## Building and Running Docker Images

### Building an Image

To build our Dockerfile into an image, we use the `docker build` command:

```bash
docker build -t your-dockerhub-username/hello-docker .
```

The `-t` flag assigns a tag (name) to our image, and the `.` specifies the current directory as the build context.

Docker is intelligent about reusing layers. If you already have a layer cached, Docker won't rebuild it, making subsequent builds much faster.

### Running a Container

To run our image as a container:

```bash
docker run your-dockerhub-username/hello-docker
```

This creates a running container based on our image, executes the default command, prints "hello Docker," and exits.

## Working with Interactive Containers

### Running Ubuntu Interactively

Let's explore running a full operating system in a container:

```bash
docker run -it --name test ubuntu
```

**Understanding the Flags:**

- `-i` or `--interactive`: Keeps standard input open
- `-t` or `--tty`: Allocates a pseudo-TTY for terminal interaction
- `--name test`: Assigns a specific name to the container

When you run this command, you're transported into a Ubuntu environment running on your host machine. You can explore the file system, run commands, and interact with the system as if you were on a native Ubuntu installation.

### Container Lifecycle Management

**Automatic Cleanup:**

```bash
docker run --rm -it ubuntu
```

The `--rm` flag automatically removes the container when it exits, preventing accumulation of stopped containers.

**Running in the Background:**

```bash
docker run -d --name apache httpd
```

The `-d` flag runs the container in detached mode (background), returning only the container ID.

## Working with Web Servers

### Running Apache HTTP Server

```bash
docker run --rm --name apache -p 8080:80 -d httpd
```

**Port Publishing:**
The `-p 8080:80` flag publishes the container's port 80 to the host's port 8080. The format is `host-port:container-port`.

This allows you to access the web server running inside the container from your host machine at `localhost:8080`.

### Understanding Port Mapping

Docker doesn't automatically expose container ports for security reasons. You must explicitly publish ports you want to access from outside the container. The container believes it owns the entire system and can bind to any port, but Docker provides network isolation.

## Container Management Commands

### Essential Docker Commands

**List running containers:**

```bash
docker ps
```

**View container logs:**

```bash
docker logs container-name-or-id
```

**Follow logs in real-time:**

```bash
docker logs -f container-name-or-id
```

**Stop a running container:**

```bash
docker kill container-name-or-id
```

**Execute commands in running containers:**

```bash
docker exec -it container-name bash
```

## Working with Volumes

### Mounting Host Directories

Volumes allow you to mount directories from your host machine into containers, enabling data persistence and file sharing.

```bash
docker run --rm --name apache -p 80:80 -v /path/to/local/html:/usr/local/apache2/htdocs -d httpd
```

The `-v` flag creates a volume mount with the format `host-path:container-path`. This allows you to edit files on your host machine and see changes reflected immediately in the running container.

### Volume Benefits

- **Persistence**: Data survives container restarts
- **Development**: Edit files locally while testing in containers
- **Sharing**: Multiple containers can share the same volume

## Exploring Pre-built Images

### Operating Systems

- **Ubuntu**: `docker run -it ubuntu`
- **Alpine Linux**: `docker run -it alpine`
- **Amazon Linux**: `docker run -it amazonlinux`

### Programming Languages

- **Python**: `docker run -it python`
- **Node.js**: `docker run -it node`

### Applications and Services

- **WordPress**: `docker run -p 8000:80 wordpress`
- **MongoDB**: `docker run mongo`
- **PostgreSQL**: `docker run postgres`

## Development Tools and Extensions

### Docker Desktop

Docker Desktop provides a graphical interface for managing containers and images, viewing logs, and monitoring resource usage.

### Visual Studio Code Docker Extension

The Microsoft Docker extension for VS Code offers:

- Container and image management
- Log viewing and streaming
- File system exploration within containers
- Shell attachment to running containers
- Right-click context menus for common operations

## Best Practices and Tips

### Documentation First

Always start with official documentation rather than Stack Overflow or random tutorials. Docker has excellent documentation that's written for developers at all levels.

### Learning by Doing

Don't just watch demonstrations. Type commands yourself, experiment with different options, and learn from any errors you encounter.

### Resource Management

Docker can consume significant disk space through cached images and layers. Use `--rm` flags when appropriate and regularly clean up unused resources.

### Security Considerations

Be cautious about which ports you expose. Every open port represents a potential security risk, especially in production environments.

## Next Steps

This week focuses on getting Docker set up on your machine and becoming comfortable with basic container operations. Next week, we'll dive deeper into authoring sophisticated Dockerfiles and building more complex applications.

### Recommended Exercises

1. Explore Docker Hub (hub.docker.com) and try running different images
2. Practice mounting volumes with different applications
3. Experiment with port mapping using various web servers
4. Install and configure the VS Code Docker extension
5. Try running databases and connecting to them from your host machine

The goal is to become comfortable with the fundamental concepts of images, containers, and volumes before we move on to more advanced topics like multi-stage builds and container orchestration.
