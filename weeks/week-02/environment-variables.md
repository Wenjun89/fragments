# Environment Variables in Cloud Computing

## Lecture

<https://www.youtube.com/watch?v=-AoOwqR_-78>

## Introduction

Environment variables are a fundamental concept in cloud computing and application deployment. They allow us to configure applications at runtime without modifying the source code, enabling the same codebase to run in different environments with different configurations.

## What Are Environment Variables?

Environment variables are dynamic values that exist within the operating system environment where a program runs. A program consists of:

- Source code
- Runtime environment (like Node.js)
- Dependencies
- **Environment variables** (configuration that can change behavior)

This separation allows the same source code to run differently based on the environment configuration. Common use cases include:

- Adjusting log levels (verbose for debugging, minimal for production)
- Switching between development, staging, and production configurations
- Managing API keys and credentials securely

## The 12-Factor App Methodology

Environment variables are prominently featured in the [12-Factor App](https://12factor.net/) methodology, specifically Factor #3: Config. This influential document provides guidelines for building modern applications.

### Key Principles

1. **Store config in the environment, not in source code**
2. **Config varies between deploys** (staging, production, development, testing, CI)
3. **Single codebase, multiple configurations**

### The Litmus Test

> "A litmus test for whether an app has all config correctly factored out of the code is whether the codebase could be made open source at any moment without compromising any credentials."

This means sensitive information like:

- AWS credentials
- API keys
- Database passwords
- Client IDs

Should never be hardcoded in source code.

## Working with Environment Variables in Unix Shells

### Setting Environment Variables

```bash
export VARIABLE_NAME=value
```

**Naming conventions:**

- Use ALL_CAPS
- Use underscores for spaces
- Examples: `PORT`, `AWS_SECRET_KEY`, `LOG_LEVEL`

### Accessing Environment Variables in Bash

```bash
echo $VARIABLE_NAME
```

### Removing Environment Variables

```bash
unset VARIABLE_NAME
```

### Viewing All Environment Variables

```bash
env
```

**Warning:** Be careful when logging environment variables, as they may contain sensitive credentials.

## Environment Variables in Node.js

### Accessing Environment Variables in Node.js

Node.js provides access to environment variables through the global `process.env` object:

```javascript
const port = process.env.PORT;
const logLevel = process.env.LOG_LEVEL;
```

### Basic Example

```javascript
const port = process.env.PORT || 8080; // Default to 8080 if not set
console.log(`Server running on port ${port}`);
```

## Using .env Files

### The dotenv Module

Instead of manually setting environment variables each time, use the popular `dotenv` module to load variables from a file:

```javascript
require('dotenv').config();
```

### File Structure

Create two types of files:

1. **`.env.example`** - Template file (safe for Git)
2. **`.env`** - Actual configuration (never commit to Git)

### Example .env.example File

```bash
# Web server configuration
PORT=3000

# AWS Configuration
# See: https://docs.aws.amazon.com/credentials
AWS_SECRET_KEY=

# Database settings
DB_HOST=localhost
DB_PORT=5432

# Logging configuration
# Options: debug, info, warn, error
LOG_LEVEL=info
```

### Example .env File

```bash
PORT=3000
AWS_SECRET_KEY=your-actual-secret-key-here
DB_HOST=production-db.example.com
DB_PORT=5432
LOG_LEVEL=error
```

## Git Security Best Practices

### .gitignore Configuration

Always add environment files to `.gitignore`:

```gitignore
# Environment variables
.env
.env.*
!.env.example
```

This configuration:

- Ignores all `.env` files
- Allows `.env.example` to be committed
- Prevents accidental credential exposure

### Avoiding Common Mistakes

1. **Never use `git add .`** - Always be specific about what you commit
2. **Always check your commits** before pushing
3. **Use meaningful commit messages** that help identify what's being changed

## Error Handling and Validation

### Providing Default Values

```javascript
const port = process.env.PORT || 8080;
const logLevel = process.env.LOG_LEVEL || 'info';
```

### Required Environment Variables

For critical configuration, fail fast if variables are missing:

```javascript
const awsSecretKey = process.env.AWS_SECRET_KEY;

if (!awsSecretKey) {
  console.error('Missing AWS_SECRET_KEY in environment');
  process.exit(1);
}
```

### Better Error Handling with Logging

```javascript
if (!awsSecretKey) {
  logger.error('Missing AWS_SECRET_KEY in environment');
  process.exit(1);
}
```

## Advanced Techniques

### Runtime Variable Overrides

Override environment variables when running commands:

```bash
PORT=5555 LOG_LEVEL=debug npm start
```

### Cross-Platform Compatibility

For Windows compatibility, use the `cross-env` package:

```bash
npm install cross-env
```

```bash
cross-env PORT=5555 LOG_LEVEL=debug npm start
```

### Multiple Environment Configurations

Use `env-cmd` to load specific environment files:

```bash
npm install env-cmd
```

Package.json scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "debug": "env-cmd -f .env.debug node index.js",
    "test": "env-cmd -f .env.test npm test"
  }
}
```

## Summary

Environment variables are essential for:

1. **Security** - Keeping credentials out of source code
2. **Flexibility** - Running the same code in different environments
3. **Configuration Management** - Centralizing application settings
4. **Deployment** - Enabling different configurations without code changes

### Key Takeaways

- Always use `.env` files for local development
- Never commit actual environment files to Git
- Validate required environment variables at startup
- Use descriptive comments in `.env.example` files
- Be explicit about what you commit to version control
- Consider using tools like `cross-env` and `env-cmd` for enhanced workflow

Environment variables form the foundation of modern cloud application deployment, enabling the separation of code and configuration that makes applications portable and secure across different environments.
