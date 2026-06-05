# Week 8: Continuous Delivery and Container Registries

## Lecture

<https://www.youtube.com/watch?v=a_3Hc3dF6fQ>

### Topics Covered

This week we focus on continuous delivery, building upon the continuous integration pipelines we have previously discussed. We'll cover:

- Continuous delivery definition and implementation
- Git tagging and releasing
- Building Docker images in GitHub Actions
- Pushing images to Docker registries
- Container registries (Docker Hub and Amazon ECR)
- Using GitHub Actions to manage building and deploying images

### Course Progress

We have spent the first month setting up servers manually, working with EC2, cloud instances, and security configurations. We then transitioned to Docker and container optimization. Now we are learning to deploy containers into production environments.

The final third of the course focuses on AWS managed services, where Amazon manages the operating system and infrastructure while we focus on using specific services like Elastic Container Registry and S3.

## Assignment 2 Overview

Assignment 2 is due at the end of next week. This assignment builds upon Assignment 1 with similar deliverables and a checklist format. The key requirements include:

- Dockerizing everything properly
- Implementing more backend features
- Ensuring the frontend is dockerized
- Applying concepts from the middle third of the course

The assignment breaks down the large specification into manageable pieces rather than implementing everything at once.

## CI/CD Pipelines

### Pipeline Overview

A CI/CD pipeline represents a flow from development to deployment:

1. **Development Phase**: Developers write code locally, commit, and push to Git
2. **Continuous Integration**: GitHub Actions trigger to run linters, install dependencies, and run unit tests
3. **Continuous Delivery**: Build Docker images, push to registries, and deploy to cloud infrastructure

The goal is to automate the entire process from developer code to user-facing applications.

### Continuous Integration vs. Continuous Delivery

**Continuous Integration (CI)**:

- Makes it easy to build and test code often
- Runs every time new code is pushed
- Sets up projects, installs dependencies, builds and runs automated tests
- Focuses on internal developer stability
- Prevents regressions in the codebase

**Continuous Delivery (CD)**:

- Builds and ships code often
- Focuses on customer/user stability and upgrades
- Triggered by tags rather than every commit
- Builds production versions and pushes artifacts to registries
- Automates releases to staging and production environments

### Staging vs. Production Environments

**Production Environment**:

- The environment that end users interact with
- Requires real infrastructure, domain names, production databases
- Must be stable and reliable

**Staging Environment**:

- A duplicate of the production environment
- Used by development teams to test before production deployment
- Safe place to trial run deployments and catch issues

## Development Philosophy

### Incremental Development

Break features into smaller batches rather than building entire specifications at once. Start with a working program that does minimal functionality, then incrementally add features. This approach allows for:

- Working programs from the beginning
- Faster feedback loops
- Easier debugging and testing
- Continuous value delivery

### Shortened Release Cycles

Modern software delivery has shifted from physical distribution (boxes, CDs) to digital downloads and automatic updates. This enables:

- More frequent releases (weeks instead of years)
- Faster time to market
- Continuous security updates
- Smaller, manageable changes

### Automation and Boring Releases

Remove all manual steps from the release process. Releases should be automated and predictable, handled by robots rather than humans. This reduces errors and enables frequent deployments.

### "Dog Fooding"

Use your own product internally before releasing to customers. This creates tight feedback loops where internal users can identify and report issues before they reach external customers.

## Requirements for Continuous Delivery

### Highly Testable Code

Code must have comprehensive automated tests including:

- Unit tests
- Integration tests
- End-to-end tests

Without good test coverage, CI/CD pipelines cannot ensure code quality.

### Highly Deployable Code

Deployments must be automated and consistent. Docker containers solve this by providing:

- Consistent runtime environments
- Simplified deployment processes
- Infrastructure abstraction

## Release Frequency

### Shipping Philosophy

The key principle: **Ship, ship, ship**. As noted by Cloudflare's CEO, "The surest way to fail in tech is to fail to ship." It's better to ship something minimal, imperfect, or incomplete than to wait for perfection.

Software is never truly "finished" - it requires constant updates for security, dependencies, and new features. Embracing frequent shipping enables:

- Early user feedback
- Faster iteration cycles
- Reduced risk per release

### Release Triggers

**Every Commit**:

- Automatically deploy every merge to main branch
- Maximum access for internal teams
- Risk of deploying broken code

**Tagged Releases**:

- Manual intervention required to create tags
- More controlled release process
- Allows for testing and validation periods

**Hybrid Approach**:

- Deploy every commit to staging
- Deploy tagged releases to production
- Balances automation with safety

## Git and Docker Tagging

### Git Tags

Git tags provide immutable names for specific commits:

- Never change once created
- Enable easy rollback to previous versions
- Support debugging and issue reproduction
- Use semantic versioning (e.g., v1.2.3)

**Creating Tags**:

```bash
git tag -a v0.3.4 -m "Release version 0.3.4"
git push origin --tags
```

**NPM Version Helper**:

```bash
npm version patch  # Increments patch version
npm version minor  # Increments minor version
npm version major  # Increments major version
```

### Docker Tags

Docker supports multiple tags per image:

- Can be mutable (like `latest`) or immutable
- Enable different versioning strategies
- Support both commit SHAs and semantic versions

**Example Multi-tagging**:

```bash
docker build -t myapp:sha-abc123 -t myapp:v1.2.3 -t myapp:latest .
```

### Semantic Versioning

Version format: `MAJOR.MINOR.PATCH`

- **Major**: Breaking changes, incompatible API changes
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, backwards compatible

**Important Rules**:

- Never change a released version
- Always increment forward
- Reset lower components to zero when incrementing higher components

## Container Registries

### Docker Hub

**Pricing Tiers**:

- **Personal**: Free, unlimited public repos, 200 pulls per 6 hours
- **Pro**: $5/month, unlimited private repos, 5,000 pulls per day
- **Team/Business**: Higher limits and additional features

**Limitations**:

- Pull rate limits can be problematic for CI/CD
- May require paid plans for team usage

### Amazon Elastic Container Registry (ECR)

**Pricing Model**:

- First 50GB storage free per month
- $0.10 per GB after that
- 5TB free egress outside AWS
- Unlimited free bandwidth within AWS

**Benefits**:

- Tight integration with AWS services
- No pull rate limits within AWS
- Enterprise-grade security and compliance

### Self-Hosted Registries

Run your own Docker registry using the official registry container:

```bash
docker run -d -p 5000:5000 --name registry registry:2
```

**Advantages**:

- Complete control over storage and bandwidth
- Custom authentication schemes
- No external dependencies

## Amazon ECR Setup

### Repository Creation

1. Choose public or private repository (cannot be changed later)
2. Provide repository name
3. Configure tag immutability settings
4. Note the full repository URL format

**ECR URL Format**:

```
{account-id}.dkr.ecr.{region}.amazonaws.com/{repository-name}:{tag}
```

### Authentication

ECR requires authentication for private repositories. The process involves:

1. Configure AWS credentials (access key, secret key)
2. Use AWS CLI to generate temporary Docker password
3. Login Docker client to ECR registry

**Login Command**:

```bash
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-east-2.amazonaws.com
```

### CloudLabs Considerations

In the AWS CloudLabs environment, you access credentials via "Access Key Details" button in the CloudLabs landing page for each student

## GitHub Actions Integration

### Encrypted Secrets

GitHub provides encrypted secret storage for sensitive information:

- Secrets are encrypted at rest
- Cannot be read once stored, only written
- Accessed in workflows using `${{ secrets.SECRET_NAME }}`

**Setting Secrets**:

- Via GitHub web interface: Settings → Secrets → Actions
- Via GitHub CLI: `gh secret set SECRET_NAME -b "secret_value"`

### Security Best Practices

1. Use environment variables to access secrets:

```yaml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
```

1. Limit action permissions appropriately
2. Use official actions from Docker, AWS, etc.
3. Be cautious with third-party actions

### Common Workflow Steps

1. **Setup BuildX**: Enhanced Docker build capabilities
2. **Login to Registry**: Authenticate with Docker Hub or ECR
3. **Build and Push**: Create and upload Docker images

**Example Workflow Structure**:

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v4

- name: Login to DockerHub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Build and push
  uses: docker/build-push-action@v7
  with:
    push: true
    tags: user/app:latest
```

## Lab Overview

This week's lab focuses on implementing continuous delivery workflows that:

- Build Docker images automatically
- Push to both Docker Hub and Amazon ECR
- Use proper tagging strategies
- Implement secure credential management
- Create the foundation for future AWS deployments

The lab provides hands-on experience with all concepts covered in this lecture, preparing you for more advanced deployment scenarios in upcoming weeks.
