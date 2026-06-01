# Introduction to Hurl: HTTP Testing Tool

## Lecture

<https://www.youtube.com/watch?v=5gv7752KWqo>

## Overview

Welcome to our exploration of **Hurl**, a powerful command-line tool for HTTP testing that I've been using for several years. Hurl is particularly valuable for learning new testing frameworks and tools, which is an essential skill when working with different APIs and testing environments.

## What is Hurl?

Hurl is based on **curl** but allows you to write test cases in a syntax similar to curl commands. Instead of writing code, you write descriptions of requests and expected responses to verify that your APIs work as expected.

### Key Features

- Plain text format for defining HTTP requests
- Chain multiple requests together
- Capture values from responses for use in subsequent requests
- Built-in assertion capabilities
- Fast execution (written in Rust)

## Installation

Hurl is written in **Rust** (a modern systems programming language that's faster and safer than C++). Many JavaScript ecosystem tools are being rewritten in Rust for performance benefits.

### Installing via npm

```bash
npm install --save-dev @orange-opensource/hurl
```

Note: The package uses the `@orange-opensource` scope because the simple `hurl` name was already taken in the npm registry.

### Running Hurl

Add to your `package.json` scripts:

```json
{
  "scripts": {
    "test": "hurl --test *.hurl"
  }
}
```

You can also specify glob patterns for test files:

```bash
hurl --test tests/integration/*.hurl
```

## Basic Syntax

### Simple Health Check Test

Create a file called `simple.hurl`:

```hurl
GET http://localhost:80

HTTP/1.1 200
```

This test:

1. Makes a GET request to `localhost:80`
2. Expects an HTTP/1.1 200 response

### Enhanced Health Check with Headers

```hurl
# Health check endpoint test
# Should return 200 with proper headers and JSON response
GET http://localhost:80

HTTP/1.1 200
Cache-Control: no-cache
Content-Type: application/json; charset=utf-8
```

## Working with JSON Responses

### JSON Path Assertions

Hurl supports **JSON Path** for querying into JavaScript objects. Use `$` to refer to the root object, then use dot notation to access properties.

Example response object:

```json
{
  "status": "ok",
  "author": "John Doe",
  "githubUrl": "https://github.com/username/repo",
  "version": "0.7.4"
}
```

### Assertion Examples

```hurl
GET http://localhost:80

HTTP/1.1 200
Cache-Control: no-cache
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" startsWith "https://github.com"
jsonpath "$.version" matches "\\d+\\.\\d+\\.\\d+"
```

## Advanced Features

### POST Requests with Authentication

```hurl
# Step 1: Create a new fragment
POST http://localhost:80/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```

This is a fragment

```

HTTP/1.1 201
Content-Type: application/json; charset=utf-8
[Asserts]
header "Location" matches "http://localhost:80/v1/fragments/[a-zA-Z0-9_-]+"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.size" == 18
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.ownerId" matches "[a-zA-Z0-9_-]+"
```

### Capturing Variables

You can capture values from responses to use in subsequent requests:

```hurl
# Step 1: Create a fragment
POST http://localhost:80/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
```

This is a fragment

```

HTTP/1.1 201
[Captures]
fragment_url: header "Location"

# Step 2: Get the fragment we just created
GET {{fragment_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 18
```

This is a fragment

```

```

## Available Assertions

Hurl provides numerous assertion predicates:

### Comparison Operators

- `==` (equals)
- `!=` (not equals)
- `>` (greater than)
- `<` (less than)
- `>=` (greater than or equal)
- `<=` (less than or equal)

### String Operations

- `startsWith`
- `endsWith`
- `contains`
- `includes`
- `matches` (regular expressions)

### Type Checking

- `isString`
- `isInteger`
- `isBoolean`
- `exists`

## Integration Testing Workflow

A typical integration test might follow this pattern:

1. **Create** a resource (POST)
2. **Verify** the resource was created (GET)
3. **Update** the resource (PUT)
4. **Verify** the update (GET)
5. **Delete** the resource (DELETE)
6. **Confirm** deletion (GET expecting 404)

## Best Practices

1. **Read the Documentation**: Hurl has excellent documentation with many examples
2. **Start Simple**: Begin with basic GET requests and gradually add complexity
3. **Use Comments**: Document your test steps clearly
4. **Leverage Variables**: Capture and reuse values between requests
5. **Test Edge Cases**: Use assertions to verify error conditions and edge cases

## Performance Benefits

- **Fast Execution**: Tests run in milliseconds due to Rust implementation
- **Minimal Setup**: No complex test framework configuration required
- **Readable Format**: Plain text format is easy to understand and maintain

## Conclusion

Hurl provides an excellent way to write integration tests that are:

- Fast to write and execute
- Easy to read and maintain
- Closely aligned with manual testing workflows
- Powerful enough for complex API testing scenarios

The tool bridges the gap between manual API testing with curl and automated integration testing, making it an invaluable addition to your testing toolkit.

```

```
