# Week 4: EC2 Instances

## Lecture

<https://www.youtube.com/watch?v=6vhE8SCEh_w>

## Introduction

This week we will focus on Amazon's primary Infrastructure as a Service (IaaS) offering, EC2, covering security, access configuration, SSH connections, application deployment, and working with Amazon Linux 2. We will also discuss your first assignment, which is due at the end of next week.

## What is EC2?

The Elastic Compute Cloud (EC2) is one of Amazon's oldest services and serves as the foundation for nearly everything they run. EC2 represents one of the lowest levels of cloud computing - the compute layer itself - providing virtual machine instances on demand.

### Key Features

EC2 provides self-serve, on-demand instances that run in the cloud and are suitable for various use cases:

- **Production deployments**: Running servers like microservices
- **Staging environments**: Creating environments identical to production for testing
- **CI pipelines**: Similar to GitHub Actions using virtual machines in the cloud
- **Testing and development**: Accessing specific hardware requirements or configurations

### Elasticity and Scaling

The "Elastic" in Elastic Compute Cloud refers to the ability to automatically add and remove instances. Amazon includes auto-scaling tools that allow horizontal scaling by adding duplicate instances behind a load balancer.

### Usage Statistics

EC2's popularity continues to grow dramatically (e.g., in 2021 there were 60 million EC2 instances launched per day - twice as many as in 2019).

## Infrastructure and Regions

EC2 instances run in data centers located within availability zones, which are clustered into regions. The region we will use is US East One, located in North Virginia. Amazon operates regions worldwide, allowing you to:

- Deploy close to your users for better performance
- Meet governmental regulations for data retention
- Deploy across multiple regions for redundancy

## Pricing Models

### On-Demand Instances

- Pay only for what you use
- Billed by the second
- No commitment or contracts required
- Most expensive option but provides immediate access

### Spot Instances

- Up to 90% cheaper than on-demand
- Use Amazon's excess capacity
- Can be terminated at any moment when capacity is needed
- Suitable for stateless, scalable applications

### Savings Plans

- Reduced pricing for committed usage (1-3 years)
- Better for known, long-term workloads

### Free Tier

- Available for first 12 months
- T2 Micro instance (1 vCPU, 1 GB RAM)
- 750 hours per month for free
- Perfect for learning and basic Node.js applications

## Instance Types

Amazon offers over 500+ different EC2 instance types, categorized by use case:

### General Purpose

- Balanced CPU, memory, storage, and networking
- Available in x86_64 and ARM architectures
- T2 Nano through various larger sizes

### Specialized Types

- **Compute Optimized**: High CPU for parallel processing
- **Memory Optimized**: Up to 24 terabytes of RAM
- **Accelerated Computing**: FPGAs and GPUs for machine learning
- **Storage Optimized**: High-performance storage solutions

### CloudLabs Limitations

In the lab accounts, you can use:

- Instance sizes: nano, micro, small, types T2/T3/T3A
- Recommended: T2.micro (1 GB RAM, 1 vCPU)

## Amazon Machine Images (AMIs)

Every EC2 instance requires an AMI - a pre-configured operating system with applications, tools, libraries, and security settings. We will focus on Amazon Linux, which is:

- Based on CentOS/Red Hat Enterprise Linux
- Optimized for AWS environment
- Maintained by Amazon with 5-year support
- Includes security hardening and AWS integration

### Available AMIs

- Amazon Linux (recommended). At the time of writing, Amazon Linux 2023 was the latest official Amazon Linux version, but confirm that there isn't something newer
- Windows (incurs additional licensing costs)

## Creating an EC2 Instance

### Step-by-Step Process

1. **Select AMI**: Choose Amazon Linux 2023 AMI (x86_64 recommended)
2. **Choose Instance Type**: Select T2.micro for free tier
3. **Configure Instance Details**:
   - Set IAM role to "LabInstanceProfile" (critical for lab access)
   - Configure auto-scaling if needed
4. **Add Storage**: Default 8 GB SSD is sufficient for our needs
5. **Add Tags**: Optional metadata for organization (e.g., lab=4)
6. **Configure Security Group**: Set up firewall rules

### Security Groups

Security groups act as network-level firewalls. You must configure:

- **SSH access**: Port 22 for terminal access
- **Application access**: Port 8080 for Node.js applications
- **Source restrictions**: Consider limiting to your IP address instead of 0.0.0.0/0

**Security Warning**: Opening ports to 0.0.0.0/0 allows access from anywhere on the internet. This is convenient but less secure.

## SSH Access and Key Pairs

### Key Pair Creation

Amazon uses SSH key pairs instead of passwords:

- Amazon generates a public/private key pair
- Public key is installed on the EC2 instance
- Private key (.pem file) is downloaded to your computer
- **Critical**: You cannot re-download the private key

### SSH Connection Process

```bash
ssh -i /path/to/your-key.pem ec2-user@your-instance-ip
```

Components:

- `-i`: Identity file (your .pem key)
- `ec2-user`: Default username for Amazon Linux 2
- `@your-instance-ip`: Public IP or DNS name of your instance

### How SSH Security Works

1. You initiate connection to EC2 instance on port 22
2. Server sends a random challenge string
3. Your SSH client encrypts the challenge using your private key
4. Server decrypts using the stored public key
5. If decryption matches the original challenge, connection is established
6. All subsequent communication is encrypted

## Amazon's Shared Responsibility Model

### Amazon's Responsibilities

- Physical infrastructure and data centers
- Virtualization layer and below
- Compute, storage, database, networking hardware
- Physical security of facilities

### Your Responsibilities

- Operating system updates and security patches
- Application security and configuration
- Network and firewall configuration
- Customer data protection and encryption
- All software installed on the instance

**Important**: Any software you install becomes your responsibility to maintain and secure.

## Working with Amazon Linux 2023

Amazon Linux 2023 is a CentOS-based distribution optimized for AWS:

- Enterprise-grade security and stability
- 5-year support lifecycle
- Pre-configured for AWS services
- Uses YUM package manager

### Essential Unix Commands

You should be familiar with these command categories:

**Navigation and File Management**

- `ls`, `cd`, `pwd`, `mkdir`, `rmdir`
- `cp`, `mv`, `rm`, `chmod`, `chown`

**Text Processing and Search**

- `cat`, `less`, `head`, `tail`, `grep`
- `find`, `sort`, `uniq`, `wc`

**Archives and Compression**

- `tar`, `gzip`, `zip`, `unzip`

**System Administration**

- `sudo`, `ps`, `top`, `df`, `du`

**Network Operations**

- `curl`, `wget`, `ping`, `netstat`

**Text Editors**

- Choose one: `nano`, `vim`, or `emacs`

## Package Management with YUM

YUM (Yellowdog Updater Modified) manages software packages on Amazon Linux 2023:

### Common YUM Commands

```bash
# Update all packages
sudo yum update

# Search for packages
yum search package-name

# Install packages
sudo yum install package-name

# Remove packages
sudo yum remove package-name
```

### Alternative Installation Methods

Some software uses curl and bash installation:

```bash
curl -o- https://example.com/install.sh | bash
```

**Security Warning**: This downloads and executes scripts from the internet. Only use trusted sources and review scripts when possible.

## Node Version Manager (NVM)

NVM allows you to install and switch between different Node.js versions:

### Installation

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

### Usage

```bash
# Install specific Node version
nvm install 16.15.0

# Use specific version
nvm use 16.15.0

# Install and use LTS version
nvm install --lts
nvm use --lts
```

## Secure Copy (SCP)

SCP allows file transfer between local and remote machines over SSH:

### Syntax Examples

```bash
# Copy local file to remote
scp -i your-key.pem file.txt ec2-user@remote-host:file.txt

# Copy remote file to local
scp -i your-key.pem ec2-user@remote-host:file.txt ./local-file.txt

# Copy to home directory (same filename)
scp -i your-key.pem file.txt ec2-user@remote-host:
```

## CloudLabs Limitations

### Instance Restrictions

- Maximum instance sizes: nano through small
- On-demand pricing only (no reserved instances)
- Limited AMI selection

### Lifecycle Management

- Instances pause when lab stops
- Instances resume when lab starts
- IP addresses change with each restart
- Consider Elastic IP for consistent addressing (additional cost)

## Best Practices

### Security

- Use security groups to restrict access
- Keep operating system and packages updated
- Limit SSH access to your IP address when possible
- Regularly review and remove unused software

### Cost Management

- Use appropriate instance sizes for your workload
- Stop instances when not in use
- Monitor usage through AWS console
- Use tags for resource organization

### Development Workflow

- Start with T2.micro for development and testing
- Scale up only when necessary
- Use version control for your applications
- Automate deployments when possible

## Conclusion

EC2 provides powerful, flexible compute resources in the cloud. While it offers great control and customization options, it also comes with significant responsibility for security and maintenance. Understanding EC2 fundamentals is crucial for cloud development, even as you move to higher-level services that abstract away much of this complexity.

In Lab 4, you will create and manage your own EC2 instances, configure SSH access, and deploy your microservice to run in the cloud. This hands-on experience will give you practical knowledge of cloud infrastructure management.
