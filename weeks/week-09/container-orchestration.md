# Week 9: Managed Services and Container Orchestration

## Lecture

<https://www.youtube.com/watch?v=30VfKf6BPG0>

## Introduction to Managed Services

### What Are Managed Services?

Managed services represent a shift from manual infrastructure management to leveraging services operated by AWS. Instead of managing software stacks ourselves, we delegate responsibility to AWS and focus on running applications on top of these services.

### Software as a Service (SaaS) Model

Software as a Service focuses on the application layer, allowing developers to:

- Use databases, storage, compute, or AI services without worrying about underlying infrastructure
- Ignore hardware, networking, and storage configurations
- Avoid manual updates and maintenance
- Focus solely on the application layer

### Moving Away from Manual Work

Previously, running microservices on EC2 instances required extensive manual work:

- Code deployment and updates
- Package management
- Environment setup and configuration
- Security updates for operating systems
- Ongoing maintenance

With managed services, we can focus on the core requirement: running containers from images without managing the underlying infrastructure.

## Cloud Service Tiers

The progression from on-premises to fully managed services includes:

1. **On-Premises**: Complete infrastructure management including physical operations
2. **Infrastructure as a Service (IaaS)**: Managing from the operating system up (EC2 example)
3. **Platform as a Service (PaaS)**: Managing only the application platform (Heroku example)
4. **Software as a Service (SaaS)**: Using specific features or services without infrastructure concerns

## AWS Services Overview

### Services We Will Use

- **Amazon Cognito**: Serverless authentication and authorization (already implemented)
- **Elastic Container Registry (ECR)**: Private Docker image registry
- **Elastic Container Service (ECS)**: Container orchestration and management
- **AWS Fargate**: Serverless compute for containers
- **Amazon S3**: Object storage for large data blobs
- **DynamoDB**: NoSQL database for metadata
- **CloudWatch**: Monitoring and logging services

### Container Deployment Options

AWS offers 17 different ways to run containers. In the CloudLabs environment, we have access to: Elastic Container Service (ECS) - our focus

## Container Orchestration

### Beyond Development Docker

While Docker CLI and Docker Desktop are excellent for development and CI/CD pipelines, production environments require orchestration for:

- **Resource Provisioning**: Automated cloud resource management
- **Scheduling**: Deploying new versions without downtime
- **Container Management**: Starting, stopping, and monitoring containers
- **Load Balancing**: Distributing traffic across multiple instances
- **Health Monitoring**: Detecting and replacing unhealthy containers
- **Security Management**: Handling secrets and access control
- **Scaling**: Adding or removing instances based on demand

### Popular Orchestration Platforms

- **Kubernetes (K8s)**: Open-source platform originally designed by Google
- **Docker Swarm**: Docker's native orchestration solution
- **Apache Mesos**: Distributed systems kernel
- **Amazon ECS**: AWS proprietary container orchestration

### Kubernetes vs ECS

**Kubernetes** is the most popular container orchestrator:

- Open-source and cloud-agnostic
- Comprehensive but complex
- Suitable for large-scale enterprise deployments
- Steep learning curve

**ECS** offers a simpler alternative:

- AWS proprietary system
- Tightly integrated with AWS services
- Lower complexity for getting started
- Suitable for AWS-focused deployments

## Elastic Container Service (ECS)

### Core Concepts

**Containers and Images**: Standard Docker containers and images we already understand

**Task Definition**: JSON configuration describing how to run one or more containers, including:

- Environment variables
- Resource requirements (CPU, memory)
- Port mappings
- Logging configuration

**Task**: Runtime instance of a task definition containing one or more running containers

**Service**: Manages tasks by:

- Maintaining desired number of running tasks
- Handling automatic scaling
- Managing deployments and updates
- Ensuring high availability

**Cluster**: Logical grouping of all ECS resources (tasks, services, etc.)

### ECS Configuration Example

#### Container Definition

- **Name**: fragments
- **Image**: Docker Hub or ECR repository URL
- **Memory**: 512 MB (soft limit)
- **CPU**: 256 units (1/4 virtual CPU)
- **Port Mapping**: 8080
- **Environment Variables**: API_URL, Cognito settings, etc.

#### Task Definition

- **Name**: fragments-task
- **Role**: LabRole (required for CloudLabs)
- **Launch Type**: Fargate
- **Resources**: Inherited from container definition

#### Service Configuration

- **Name**: fragments-service
- **Desired Count**: 1 (for development)
- **Security Group**: Allow port 8080 from internet
- **Load Balancer**: Application Load Balancer for traffic distribution

#### Cluster Setup

- **Name**: fragments-cluster
- **Infrastructure**: Managed by AWS

### Infrastructure Created

When creating an ECS cluster, AWS automatically provisions:

- CloudWatch log groups for centralized logging
- Virtual Private Cloud (VPC) for networking
- Multiple subnets across availability zones
- Security groups for access control
- Application Load Balancer for traffic distribution
- All resources defined using Infrastructure as Code (CloudFormation)

## Design Considerations for Scalable Applications

### Horizontal Scaling Principles

To support running multiple container instances:

**Resource Efficiency**: Use minimal RAM and CPU resources
**Health Checks**: Implement container health endpoints for monitoring
**Stateless Design**: Ensure servers can be terminated and restarted without data loss
**External Storage**: Use S3 and DynamoDB instead of local disk storage
**Request Independence**: Each request should work regardless of which instance handles it

### "Cattle, Not Pets" Philosophy

Treat infrastructure as disposable:

- Containers should be easily created and destroyed
- No emotional attachment to specific instances
- Focus on reproducible, automated deployments
- Design for failure and recovery

## Load Balancing and Scaling

### Load Balancer Function

The Application Load Balancer:

- Provides single endpoint for external access
- Distributes traffic across healthy container instances
- Monitors container health continuously
- Routes traffic only to healthy instances
- Handles instance failures transparently

### Container States

In a running cluster, containers exist in various states:

- **Healthy**: Ready to receive traffic
- **Starting**: New container initializing
- **Unhealthy**: Failed health checks, being replaced
- **Draining**: Being gracefully shut down

## Deployment Management

### Rolling Deployments

ECS services handle deployments by:

1. Starting new containers with updated code
2. Waiting for new containers to become healthy
3. Gradually draining traffic from old containers
4. Removing old containers once fully drained
5. Maintaining zero downtime throughout the process

### Deployment Monitoring

Track deployments through:

- **Service Events**: Chronological log of cluster activities
- **Deployment Status**: Primary vs. active deployment tracking
- **Task Counts**: Desired vs. running vs. pending instances

## Logging and Monitoring

### CloudWatch Integration

All container logs stream to CloudWatch for:

- Centralized log aggregation
- Searching and filtering capabilities
- Retention policy management
- Real-time monitoring and alerting

### Security Considerations

Production logs reveal constant attack attempts:

- Attempts to access environment files
- Git configuration probing
- Router admin page attacks
- Global IP address attack patterns

This emphasizes the importance of:

- Proper authentication (Cognito)
- Route protection
- Secret management
- Regular security updates

## Continuous Delivery with GitHub Actions

### Automated Deployment Pipeline

The complete CD pipeline:

1. Create version tag in Git
2. Push tag to GitHub
3. GitHub Actions builds new Docker image
4. Image pushed to ECR
5. Task definition updated with new image
6. ECS service deploys new version
7. Zero-downtime rolling update

### CloudLabs Considerations

Before ECS deployments, update GitHub secrets with:

- AWS Access Key ID
- AWS Secret Access Key

## Next Steps

This introduction to managed services and container orchestration sets the foundation for the remainder of the course. We will continue building on these concepts while integrating additional AWS services for a complete cloud-native application architecture.

The walkthrough document provides detailed steps for implementing ECS deployment, which is required for future assignments but not separately graded.
