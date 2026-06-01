# Unit Testing in Continuous Integration

## Lecture

<https://www.youtube.com/watch?v=nxGBC4PxcO4>

## Introduction to Unit Testing

Unit testing is a fundamental component of continuous integration workflows. When multiple developers are working on the same codebase, we need robust testing infrastructure to ensure that changes made by one developer don't break code written by another. The only way to know if our integrated code works properly is through comprehensive testing that covers all aspects of our application.

Developing a test-first mindset requires practice and dedication. Throughout this course, you will be writing tests for every new piece of code you create. This approach provides a safety net through continuous integration workflows, allowing you to make changes, update dependencies, or try new approaches while maintaining confidence that your application still works as expected.

## What is Unit Testing?

Unit testing involves decomposing a large program into individual units and testing each one separately. Depending on your programming language, these units might be functions, modules, or classes. The goal is to break down code into the smallest testable components and verify that each piece of functionality works as expected.

Beyond testing individual functions, unit testing requires testing all different execution paths through your code. Consider the various control structures in your programs:

- If, else if, and else statements
- Switch statements
- Try-catch blocks
- Asynchronous code with promises that resolve or reject
- Functions with different argument types that trigger different behaviors

Think of code execution like water flowing through a series of pipes. At any given time, only certain paths are active, creating a specific flow pattern. When testing, you want to ensure that every possible code path gets exercised - that water flows through every pipe in your system.

## Principles of Effective Unit Testing

### Independence

All tests must be independent of each other. You should be able to run your tests in any order without one test affecting another. Tests should not rely on side effects from previous tests, such as:

- Setting global variables in one test that another test accesses
- Database state changes that persist between tests
- Network calls that modify external resources

For example, testing an addition function with inputs (3, 3) should have no effect on a subsequent test with inputs (3, 4).

### Single Focus

Each test should focus on testing exactly one thing. It's tempting to write comprehensive tests that verify multiple aspects of your code simultaneously, but this approach has limitations. You cannot test both sides of a conditional branch in a single test execution.

To achieve comprehensive coverage, write many small, focused tests rather than a few large ones. Avoid testing the same conditions in multiple tests, as this creates unnecessary maintenance overhead.

### Assertions

Tests use assertions to verify expected outcomes. An assertion is a statement that something should be true. For example, when testing an addition function, you assert that 3 + 3 equals 6.

Your tests should define:

- **Expected inputs**: The data you send to your function
- **Expected outputs**: The results you anticipate
- **Black box approach**: Focus on inputs and outputs rather than implementation details

In unit tests, it's acceptable to use hard-coded values (magic numbers), which would normally be discouraged in production code. The clarity of expected outcomes is more important than avoiding magic numbers in test contexts.

## Benefits of Unit Testing

### Documentation

Tests serve as living documentation for your code. Unlike traditional documentation, tests must stay synchronized with your codebase or they will fail. This makes them more reliable than prose documentation, which often becomes outdated.

When examining unfamiliar code, reading the tests provides insight into:

- What the original developer intended the code to do
- How functions should behave with different inputs
- What edge cases were considered

### Test-Driven Development (TDD)

Test-driven development involves writing tests before implementing functionality. This approach:

1. **Starts with failing tests**: Write tests that define expected behavior
2. **Creates a contract**: Establishes exactly what your code should accomplish
3. **Guides implementation**: You know you're done when tests pass
4. **Considers edge cases**: Forces you to think through various scenarios

TDD can be particularly effective for team development, where one person writes tests based on specifications and another implements the functionality to make those tests pass.

### Limitations

Unit testing alone is insufficient for complete application verification. You will need additional testing strategies including integration tests, end-to-end tests, and other verification methods to ensure your entire system works correctly.

## Practical Example: Health Check Route

Let's examine how to translate a specification into unit tests using a health check route example.

### Specification Analysis

The specification states:

- An unauthenticated route `/` is available for checking service health
- Returns HTTP 200 status when service is running
- Includes specific JSON response body with status, author, GitHub URL, and version
- Sets cache-control header to "no-cache"

### Test Design

From this specification, we can identify several testable conditions:

1. **Authentication**: Unauthenticated users can access the route
2. **Status Code**: Returns HTTP 200 response
3. **Response Body**: Contains required JSON fields
4. **Headers**: Includes proper cache-control header

### Test Implementation

Here's how these translate to individual tests:

```javascript
// Test 1: HTTP 200 response
test('health check route should return HTTP 200 response', async () => {
  const response = await request(app).get('/');
  expect(response.status).toBe(200);
});

// Test 2: Status field
test('health check route should return status equal to okay', async () => {
  const response = await request(app).get('/');
  expect(response.body).toMatchObject({ status: 'okay' });
});

// Test 3: Cache control header
test('health check route should set cache-control to no-cache', async () => {
  const response = await request(app).get('/');
  expect(response.headers['cache-control']).toBe('no-cache');
});
```

Notice how each test focuses on one specific aspect and remains independent of the others.

## Complex Example: POST Route Testing

Consider a more complex specification for creating fragments:

### Specification Requirements

- Authenticated users can POST to `/fragments`
- Request body contains raw binary data
- Content-Type header specifies fragment type
- Supported types: text/\*, application/json, image/png, image/jpeg, image/webp, image/gif
- Returns 415 for unsupported media types
- Returns 201 for successful creation
- Response includes Location header with fragment URL
- Response body contains fragment metadata

### Test Cases

This specification suggests numerous test scenarios:

1. **Authentication tests**:

   - Authenticated user can create fragment
   - Unauthenticated user receives error

2. **Content-Type tests**:

   - Each supported type works correctly
   - Unsupported types return 415

3. **Response validation**:

   - Successful creation returns 201
   - Location header contains correct URL
   - Metadata includes correct size, type, etc.

4. **Data integrity**:
   - Fragment size matches uploaded data
   - Content is stored correctly

## Test Coverage

Test coverage measures which lines of code are executed during test runs. Coverage tools track:

- **Lines covered**: Individual lines of code executed
- **Branches covered**: Different paths through conditional statements
- **Functions covered**: Which functions are called during tests

### Coverage Goals

- Aim for 80% or higher coverage
- 100% coverage is rarely achievable or necessary. Projects with 100% coverage are usually gaming the system to achieve a perfect score vs. doing something meaningful
- Focus on covering critical paths and edge cases
- Use coverage reports to identify untested code and improve

### Coverage Reports

Modern testing frameworks like Jest, Vitest, etc. generate detailed HTML reports showing:

- File-by-file coverage statistics
- Line-by-line execution counts
- Highlighted uncovered code sections
- Branch coverage information

These reports help identify areas needing additional tests and ensure your continuous integration provides meaningful verification of code changes.

## Best Practices

1. **Write many small tests** rather than few comprehensive ones
2. **Test edge cases** and error conditions, not just happy paths
3. **Use descriptive test names** that explain what is being tested
4. **Keep tests independent** and avoid shared state
5. **Focus on behavior** rather than implementation details
6. **Maintain tests** as you modify code
7. **Use coverage tools** to identify gaps in testing

Remember that tests are code you must maintain. Write enough tests to provide confidence in your code, but avoid redundant tests that don't add value. The goal is comprehensive coverage with minimal maintenance overhead.
