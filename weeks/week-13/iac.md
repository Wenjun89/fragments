# Week 13: Infrastructure as Code

## Lecture

<https://www.youtube.com/watch?v=jhwCuLGifuY>

## The Evolution of "As Code" Concepts

We've actually been working with "as code" concepts throughout this course, so today's ideas shouldn't seem revolutionary. Consider what we've accomplished:

### Docker: Application as Code

Docker enabled us to define our entire application and its environment - the operating system, dependencies, file system, environment variables - as a reproducible artifact. Instead of manual setup steps, we created Dockerfiles that could generate consistent containers across laptop and production environments.

### Docker Compose and ECS: Deployment as Code

We extended this concept to production environments using Docker Compose and ECS task definitions. These tools allowed us to declaratively specify:

- Which containers should run together
- Environment variables
- Volume mounts
- Exact configuration requirements

We achieved this without manual intervention - just `docker compose up` or telling ECS to run our task definition.

### Declarative Infrastructure

The key principle is **declarative configuration**: you define the desired end state, and the system makes it happen. This approach eliminates manual steps and creates reproducible, version-controlled infrastructure.

## Infrastructure as Code (IaC)

Infrastructure as Code builds on the foundational concept from week one: **cloud replaces physical infrastructure with programmable infrastructure**.

### From Physical to Programmable

Traditional data centers required:

- Physical computers
- Manual network wiring
- Physical isolation and connections

Cloud infrastructure provides:

- Virtual, programmable resources
- HTTP API management
- Code-driven configuration

### AWS Services as HTTP APIs

Remember that all AWS services are essentially HTTP APIs - just like the ones you've been building. When you use command line tools or SDK clients, they're sending HTTP requests and responses to these APIs.

Your fragments microservice demonstrates this exact pattern: creating, updating, and deleting resources via HTTP APIs. Infrastructure as Code applies this same concept to cloud resources like S3 buckets, Cognito user pools, EC2 instances, and ECS clusters.

## Benefits of Infrastructure as Code

### Cost Reduction

- Easily bring up and tear down resources
- Only pay for what you're actively using
- Developer teams can create resources during work hours and destroy them overnight

### Efficiency and Speed

- Eliminate manual console clicking
- Automate repetitive tasks
- Faster deployment cycles

### Risk Reduction

- Version-controlled infrastructure
- Reproducible deployments
- Eliminate manual configuration errors

### Visibility and Documentation

- Clear record of all infrastructure decisions
- Easy to audit and understand current state
- Troubleshoot billing and resource usage

### Testing and CI/CD Integration

Infrastructure as Code enables:

- Testing against real AWS services instead of simulations
- Creating temporary test environments
- Automated deployment pipelines
- Environment parity between development and production

### Version Control Integration

- Store infrastructure definitions in Git alongside source code
- Infrastructure and application code stay in sync
- Easy rollbacks to previous configurations
- Collaborative infrastructure development

## Infrastructure as Code Tools

### CloudFormation (AWS Native)

- **Released**: 2011
- **Format**: JSON or YAML files
- **Scope**: AWS-specific
- **Advantages**: Battle-tested, extensive documentation, comprehensive AWS support

### AWS Cloud Development Kit (CDK)

- **Approach**: Programming language-based (JavaScript, TypeScript, Python, etc.)
- **Output**: Compiles to CloudFormation
- **Advantages**: Familiar syntax for developers, programmatic constructs

### Terraform (HashiCorp)

- **Language**: HCL (HashiCorp Configuration Language)
- **Scope**: Multi-cloud support
- **Advantages**: Works across AWS, Google Cloud, Azure, and other providers

## CloudFormation Deep Dive

### Why CloudFormation?

- Mature and stable (since 2011)
- Comprehensive AWS service coverage
- Extensive community examples and documentation
- Declarative YAML/JSON syntax
- Built-in rollback capabilities

### Core Concepts

#### Templates vs. Stacks

- **Template**: The file defining your infrastructure (like a class in OOP)
- **Stack**: The running resources created from a template (like an object instance)

#### Key Features

- **Idempotent**: Safe to run templates multiple times
- **Declarative**: Define end state, not steps
- **Automatic ordering**: CloudFormation determines resource creation sequence
- **Rollback support**: Automatic cleanup on failures

### Template Structure

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Template description'

Parameters:
  # Input variables

Resources:
  # AWS resources to create

Outputs:
  # Values to return after creation
```

#### Template Sections

**AWSTemplateFormatVersion**

- Currently only one version: '2010-09-09'
- Indicates CloudFormation syntax version

**Description**

- Human-readable template description
- Informational only

**Parameters**

- Input variables for template customization
- Include type, description, and optional defaults
- Enable template reusability

**Resources**

- Core section defining AWS resources
- Each resource has a type and properties
- Required and optional properties vary by resource type

**Outputs**

- Values returned after stack creation
- Useful for configuration in other systems
- Examples: domain names, resource IDs, IP addresses

### Example: S3 Bucket Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Simple S3 bucket creation'

Parameters:
  MyBucketName:
    Type: String
    Description: 'Name for the S3 bucket'

Resources:
  MyS3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref MyBucketName
      VersioningConfiguration:
        Status: Enabled

Outputs:
  BucketName:
    Description: 'Name of the created bucket'
    Value: !Ref MyS3Bucket
```

### CloudFormation Workflow

1. **Write Template**: Create YAML/JSON file defining infrastructure
2. **Version in Git**: Store template with source code
3. **Create Stack**: Use CloudFormation to provision resources
4. **Update as Needed**: Modify template and update stack
5. **Delete When Done**: Remove all resources with single command

### Error Handling and Rollbacks

CloudFormation provides robust error handling:

- **Validation**: Checks template syntax before execution
- **Dependency Management**: Creates resources in correct order
- **Automatic Rollback**: Removes partially created resources on failure
- **Clear Error Messages**: Detailed failure information for debugging

## Practical Demonstration: Lab 2 Recreation

The Lab 2 CloudFormation template demonstrates real-world complexity:

### Resources Created

- Cognito User Pool
- User Pool Client
- Hosted UI Domain

### Template Features

- **Parameters**: App name, callback URL, username
- **Resource Dependencies**: User pool created before client
- **String Interpolation**: Dynamic resource naming
- **Outputs**: Client ID, User Pool ID, domain URL

### Benefits Demonstrated

- **Speed**: Minutes instead of manual console work
- **Consistency**: Identical setup every time
- **Cleanup**: Complete resource removal with one command
- **Documentation**: Template serves as infrastructure
