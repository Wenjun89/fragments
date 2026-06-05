# Week 4 Technical Discussion: Assignment 1 Preparation

## Lecture

<https://www.youtube.com/watch?v=U5img3xL_Bg>

## Overview

This week focuses on preparing for Assignment 1, which is due in Week 5. There will be no lab in Week 5 to allow dedicated time for assignment completion. This assignment builds progressively on the labs completed so far and requires additional independent work.

## Important Timeline Notes

- **Current Status**: Week 4 (Labs 1-3 completed, Lab 4 in progress)
- **Assignment 1 Due**: Week 5
- **Critical Warning**: This assignment requires significant time and cannot be completed last-minute!
- **Recommendation**: Begin working on Assignment 1 immediately

## Assignment Scope and Requirements

### Understanding the Specification

The assignment specification is comprehensive, but Assignment 1 only requires implementing specific portions:

- **Fragment Creation**: Support for POST operations to create fragments
- **Content Type Support**: Plain text fragments only (JSON, markdown, images come in later assignments)
- **Authentication**: Amazon Cognito integration required
- **Deployment**: Server must run on EC2 with web frontend connected

### Key Checklist Items

All requirements from the Assignment 1 checklist must be met, including:

- Proper GitHub repository setup
- Continuous Integration (CI) passing
- EC2 deployment
- Amazon Cognito authentication
- Comprehensive unit testing
- Professional code quality standards

## Technical Implementation Components

### 1. Memory Database Implementation

A mock database system for local development and testing:

#### Core Features

- **In-memory storage**: Data persists only while server runs
- **CRUD operations**: Get, Put, Query, Delete functionality
- **Asynchronous interface**: All operations return promises to simulate cloud database behavior
- **Dual-key system**: Primary key (owner ID) and secondary key (fragment ID)

#### Key Methods

```javascript
// All methods return promises
put(primaryKey, secondaryKey, value);
get(primaryKey, secondaryKey);
query(primaryKey); // Returns array of all items for primary key
delete (primaryKey, secondaryKey);
```

#### Important Implementation Details

- **Promise-based**: Uses `Promise.resolve()` to simulate asynchronous operations
- **String validation**: All keys must be strings
- **Error handling**: Throws errors for invalid operations
- **Data structure**: Simple object-based storage (`db[primaryKey][secondaryKey] = value`)

### 2. Buffer Usage in Node.js

#### Understanding Buffers

- **Purpose**: Handle binary data efficiently in Node.js
- **Use cases**: Files, strings, images, network data
- **Relationship to JavaScript**: Similar to `Uint8Array` but Node.js specific
- **Creation**: `Buffer.from()` method for various data types

#### Why Buffers Matter

- **Universal data handling**: Works with text, JSON, images, and other binary formats
- **Performance**: Optimized for binary operations
- **API compatibility**: Most Node.js APIs work with buffers
- **Future-proofing**: Prepares for handling multiple content types

### 3. Unit Testing Strategy

#### Testing Approaches Covered

1. **Implementation + Tests provided**: Memory database example
2. **Implementation provided, write tests**: Memory data provider
3. **Tests provided, write implementation**: Fragment class (Test-Driven Development)

#### Testing Best Practices

- **Independence**: Each test runs with fresh state using `beforeEach()`
- **Single responsibility**: One assertion per test
- **Error case coverage**: Test both success and failure scenarios
- **Simple test data**: Use minimal, hardcoded values for clarity
- **Coverage goals**: Aim for 80%+ code coverage, ideally 100%

#### Jest Testing Patterns

```javascript
// Async test structure
test('description', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe(expectedValue);
});

// Error testing
expect(async () => {
  await functionThatShouldThrow();
}).rejects.toThrow();
```

### 4. Fragment Class Implementation

#### Architecture Layers

1. **Database layer**: Low-level CRUD operations
2. **Data model layer**: Fragment-specific business logic
3. **Entity layer**: Fragment class with full business logic
4. **Route layer**: HTTP request/response handling

#### Key Principles

- **Separation of concerns**: Each layer handles specific responsibilities
- **Abstraction**: Higher layers don't know implementation details of lower layers
- **Testability**: Each layer can be unit tested independently

### 5. HTTP Route Implementation (POST)

#### Required Components

- **Content-Type parsing**: Use `content-type` module for header processing
- **Raw body parsing**: Express.raw() middleware for buffer handling
- **Authentication**: Integration with existing auth system
- **Response formatting**: Proper HTTP status codes and headers

#### Critical Implementation Details

- **Location header**: Must include full URL using `API_URL` environment variable
- **Content type validation**: Only support specified fragment types
- **Size limits**: 5MB maximum payload size
- **Error handling**: Proper HTTP status codes for various error conditions

#### Environment Configuration

- **API_URL variable**: Must be set for proper location header generation
- **Strategy pattern**: Configurable backend selection (memory vs. AWS)

## Development Workflow Recommendations

### Testing Workflow

1. Use `npm run test:watch` for continuous testing during development
2. Write tests first when using Test-Driven Development approach
3. Ensure all tests pass before moving to next component
4. Verify CI passes with each commit

### Code Quality Standards

- **Linting**: Code must pass all linting checks
- **Formatting**: Consistent code formatting required
- **Logging**: Use Pino logger (not console.log) with appropriate levels
- **Git hygiene**: No node_modules, cache files, or generated files in repository

### Logging Best Practices

- **Debug logs**: For development troubleshooting
- **Info logs**: For production monitoring
- **Error logs**: Include stack traces and context
- **Security**: Never log sensitive information (emails, tokens, etc.)

## Assignment Submission Requirements

### Technical Requirements

- All unit tests passing in CI
- High test coverage (80%+ minimum)
- Professional code quality
- Proper error handling and logging
- Complete implementation of checklist items

### Deployment Requirements

- Server running on EC2
- Frontend connected to EC2 instance
- Amazon Cognito authentication working
- Proper environment variable configuration

## Support and Resources

### Getting Help

- Use course discussions for questions
- Help others when possible in public forums
- Avoid private collaboration (not a group project)
- Ask questions early to allow time for responses

### Key Resources

- Assignment specification and checklist
- Memory database implementation and tests (provided)
- Fragment class tests (provided)
- Express.js documentation for raw body parsing
- Content-type module documentation

## Final Recommendations

1. **Start immediately**: This assignment requires significant time investment
2. **Read everything**: Complete assignment spec and checklist review essential
3. **Test continuously**: Write and run tests throughout development
4. **Ask questions early**: Don't wait until the last minute for help
5. **Follow the checklist**: Use it as a literal checklist for completion tracking
6. **Professional standards**: Treat this as production-quality code

The assignment builds systematically on previous labs while introducing new concepts like comprehensive testing, proper logging, and professional development practices. Success requires consistent effort throughout the development period rather than last-minute cramming.
