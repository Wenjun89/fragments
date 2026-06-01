# Technical Topics: NPM, Git, YAML, Testing, and Authentication

## Lecture

<https://www.youtube.com/watch?v=8fEoD5K35O4>

## NPM Package Management

### NPM Install vs NPM CI

When working with Node.js dependencies, it's important to understand the difference between `npm install` and `npm ci`:

**NPM Install:**

- Reads the `package.json` file to install dependencies
- Uses semantic versioning ranges (e.g., `^3.4.1`) which can install different patch/minor versions
- Generates or updates the `package-lock.json` file
- Standard command for development environments

**NPM CI (Clean Install):**

- Uses only the `package-lock.json` file with exact versions
- Deletes existing `node_modules` folder before installation
- Fails if `package-lock.json` is out of sync with `package.json`
- Recommended for production and CI environments
- Ensures consistent, reproducible builds

### Package Lock File Management

The `package-lock.json` file:

- Is automatically generated - never edit manually
- Contains exact versions of all dependencies and their dependencies
- Should be committed to version control
- Can be safely deleted and regenerated if merge conflicts occur
- Ensures all environments use identical dependency versions

### Additional NPM Commands

- `npm install-ci-test`: Combines clean install and test execution in one command
- Useful for CI pipelines where you need to install dependencies and run tests

## Git Command Line Essentials

### Core Commands You Must Know

- **add**: Move files from working directory to staging area
- **remove**: Remove files from both staging area and working directory
- **move**: Rename or relocate files
- **status**: Check current repository state
- **commit**: Create a snapshot from staged changes
- **log**: View commit history
- **push**: Sync local branch with remote repository

### Why Command Line Tools Matter

Command line proficiency is essential because:

- Cloud environments often only provide shell access
- GitHub Actions and CI/CD systems use command line tools
- Scripting and automation require command line knowledge
- GUI tools aren't available in remote environments

## YAML Fundamentals

### Basic Syntax

YAML is a superset of JSON with these key characteristics:

```yaml
# Comments use hash symbols
key: value
nested:
  property: 'string value'
  number: 42
  boolean: true
```

### Important YAML Features

**Indentation:**

- Uses 2-space indentation
- Indentation level indicates nesting structure

**String Handling:**

- Strings can be quoted or unquoted
- Single quotes, double quotes, or no quotes all work
- Multiline strings use pipe (`|`) syntax

**Lists/Arrays:**

```yaml
# Dash syntax
items:
  - first item
  - second item
  - third item

# Or JSON-style
items: ["first", "second", "third"]
```

**Objects/Key-Value Pairs:**

```yaml
# YAML object syntax, using indenting
person:
  name: "John Doe"
  age: 30
  email: "john@example.com"
  address:
    street: "123 Main St"
    city: "Anytown"
    zip: "12345"

# Or JSON-style (also correct, but less common)
person: {
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}
```

### GitHub Actions Workflow Syntax

Key resources:

- Always reference the official GitHub workflow syntax documentation
- Common patterns include `on:`, `jobs:`, and step definitions
- YAML files live in `.github/workflows/` directory
- Study open source projects for real-world examples

## Testing with Jest

We'll use Jest or Vitest, and both have similar setups. See the specific tool's docs for up-to-date examples.

### Configuration Setup

Create a `jest.config.js` file to configure:

- Test environment variables
- Timeout settings
- Logging levels
- Coverage options

```javascript
module.exports = {
  setupFiles: ['<rootDir>/env.jest'],
  testTimeout: 5000,
  // Additional configuration options
};
```

### ESLint Integration

Add Jest environment to ESLint configuration:

```json
{
  "env": {
    "jest": true
  }
}
```

### Jest CLI Options

**Test Scripts:**

- `jest --config jest.config.js`: Basic test execution
- `--runInBand`: Run tests serially (safer for learning)
- `--watch`: Continuously run tests on file changes
- `--coverage`: Generate test coverage reports
- `-- [test-name]`: Run specific tests (using NPM script pass-through)

### Jest API and Matchers

Jest uses an expressive `expect` syntax:

```javascript
// Basic equality
expect(actual).toBe(expected); // Reference equality
expect(actual).toEqual(expected); // Deep equality

// Negation
expect(actual).not.toBe(unexpected);

// Comparisons
expect(number).toBeGreaterThan(10);
expect(number).toBeLessThanOrEqual(5);

// Exception testing
expect(() => {
  throwingFunction();
}).toThrow();

// Array/object testing
expect(array).toContain(item);
expect(string).toMatch(/regex/);
```

## HTTP Testing with Supertest

### Integration with Express

Supertest allows testing Express applications without starting a server:

```javascript
const request = require('supertest');
const app = require('./app');

test('GET /api/endpoint', async () => {
  const response = await request(app)
    .get('/api/endpoint')
    .expect(200)
    .expect('Content-Type', /json/);

  expect(response.body).toEqual(expectedData);
});
```

### Authentication in Tests

For HTTP Basic Authentication:

```javascript
await request(app).get('/protected-route').auth('username', 'password').expect(200);
```

### Request Building

```javascript
await request(app)
  .post('/api/data')
  .set('Content-Type', 'application/json')
  .send({ data: 'value' })
  .expect(201);
```

### Response Testing

Access response properties:

- `response.body`: Response data
- `response.headers`: HTTP headers
- `response.status`: Status code

## Authentication Strategy

### Basic Authentication for Testing

While production applications use OAuth/Cognito, testing environments benefit from simpler authentication:

**Why Basic Auth for Tests:**

- OAuth requires browser interactions and redirects
- Automated tests need programmatic authentication
- Basic auth provides simple username/password authentication
- Easier to implement in CI/CD pipelines

**Implementation Pattern:**

```javascript
// Conditional module loading based on environment
const authModule = process.env.USE_BASIC_AUTH ? require('./basic-auth') : require('./cognito-auth');

module.exports = authModule;
```

### .htpasswd File Format

Basic authentication uses password files:

```txt
user@example.com:$2b$10$hashedpassword...
admin@example.com:$2b$10$anotherhashedpassword...
```

This approach allows:

- Simple credential management
- Automated test authentication
- Production OAuth integration
- Environment-specific authentication strategies

## Best Practices

1. **Documentation**: Always reference official documentation
2. **Comments**: Use extensive comments, especially when learning
3. **Tool Investment**: Spend time learning your development tools
4. **Environment Consistency**: Use `npm ci` for production deployments
5. **Test Independence**: Write tests that don't depend on each other
6. **Version Control**: Commit both `package.json` and `package-lock.json`
