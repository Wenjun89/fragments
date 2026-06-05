# Lab 3

This lab will build on your existing knowledge of unit testing, and get you started using Continuous Integration (CI) with the GitHub Actions cloud platform.

Automated testing and CI is a critical component of cloud deployments, since we need to be able to trust the code we ship into production. Has a recent change broken anything? It's hard to know unless you have a robust set of tests, and a simple way to run them whenever anyone updates the code.

This lab will take you some time to complete, so please give yourself lots of time to work on it. You don't need to finish it in a single sitting and are encouraged to break it up over a series of sessions. As you work, remember to use git to `add` and `commit` your changes (e.g., whenever you get something working, or make a significant change).

Take your time. Don't give up if you get stuck. Ask questions. You can do this!

NOTE: you are strongly encouraged to install the official [GitHub Actions](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions) VSCode extension to help you [author and debug](https://github.com/github/vscode-github-actions#workflow-authoring) your GitHub Actions Workflow files.

## GitHub Actions Continuous Integration

Our first task is to create a basic Continuous Integration (CI) workflow. Over the course of the lab, we'll extend this and make it do more things.

There are many tools and platforms you can use to build CI pipelines. A common approach is to use GitHub's built-in CI platform, [GitHub Actions](https://github.com/features/actions). GitHub Actions allows us to write our build, test, and deployment logic using text files in our project's source code.

1. create the following folders in the root of your repository: `.github/workflows`

2. create a workflow [YAML](https://en.wikipedia.org/wiki/YAML) file for our Continuous Integration (CI) job: `.github/workflows/ci.yml`. The name you give this file doesn't matter, so we'll use `ci.yml` as a way to remind ourselves that this is our continuous integration workflow vs. our continuous deployment workflow, which we'll write in a future lab.

GitHub Actions Workflows use [YAML](https://en.wikipedia.org/wiki/YAML) syntax. YAML is often used for cloud configurations, and it's worth learning how to read and write it. YAML is a bit like a mix of JSON, XML, and Python syntax. You can [learn the basics of YAML in a few minutes](https://learnxinyminutes.com/docs/yaml/), but there are some aspects of it that will require getting used to.

Here is what your `.github/workflows/ci.yml` file should look like:

```yml
# .github/workflows/ci.yml

# Continuous Integration (CI) Workflow
name: ci

# This workflow will run whenever we push commits to the `main` branch, or
# whenever there's a pull request to the `main` branch. See:
# https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#on
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

jobs:
  lint:
    # Give your job a name that will show up in the GitHub Actions web UI
    name: ESLint
    # We'll run this on a Linux (Ubuntu) VM, since we'll deploy on Linux too.
    runs-on: ubuntu-latest
    # We run these steps one after the other, and if any fail, we stop the process
    steps:
      # https://github.com/actions/checkout
      - name: Check out code
        uses: actions/checkout@v6

      # https://github.com/actions/setup-node
      - name: Setup node
        uses: actions/setup-node@v6
        with:
          # Use node LTS https://github.com/actions/setup-node#supported-version-syntax
          node-version: 'lts/*'
          # Cache npm dependencies so they don't have to be downloaded next time - https://github.com/actions/setup-node#caching-packages-dependencies
          cache: 'npm'

      - name: Install node dependencies
        # Use `ci` vs. `install`, see https://docs.npmjs.com/cli/v8/commands/npm-ci
        run: npm ci

      - name: Run ESLint
        run: npm run lint
```

### Triggering and Interpreting GitHub Actions Runs

1. Add the `.github/` folder to git and `commit`, then `push` your changes to GitHub:

```sh
$ git status
...see what has changed
$ git add .github
$ git commit -m "Add CI workflow for running eslint"
$ git push origin main
```

In your browser, navigate to your `fragments` GitHub repo and click on the **Actions** tab, which will take you to <https://github.com/{yourname}/fragments/actions> (replace `{yourname}` with your GitHub username).

You should see your latest commit in the list of workflow runs. Click it. You should now see the `ci.yml` workflow with an **ESLint** item within it. This is our workflow's only Job. Click **ESLint** to see all of its **Steps**. Try clicking on each of the Steps (e.g., **Setup node**, **Run ESLint**, etc) to see what happened. You will either see live output as it runs, or historical output of what it did when it ran.

Your latest commit should have a **green checkmark** next to it (indicating that this CI run was successful). If it has a **red X**, it indicates that one of the steps failed, and therefore the whole CI run failed. If you have a **red X**, you need to figure out what is failing, fix it, `add` and `commit` to git, and then `push` again to retry. Continue this process until you get a **green checkmark**. If you get stuck, ask for help.

1. If you didn't get a **red X**, let's try breaking our CI build on purpose, so that you can see what it looks like. On your local machine, navigate to `src/index.js` and add the following line to the end of the file, which will cause an ESLint error:

```js
const unneededVariable = 'This variable is never used';
```

Save the file and try running `eslint` from the command line. Make sure that it fails:

```sh
$ npm run lint

> fragments@0.0.1 lint
> eslint "./src/**/*.js"


/Users/humphd/CCP555/fragments/src/index.js
  24:7  error  'unneededVariable' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

Once you are sure that you've broken things locally, `add` and `commit` the `src/index.js` file to git, and `push` to GitHub. Go back to <https://github.com/{yourname}/fragments/actions> in your browser, and watch your GitHub Actions CI Workflow run. Confirm that it fails. Click on the commit you just made, then click on your **ESLint** job and the **Run ESLint** step. Find the error and take a screenshot to submit later.

On your local computer, fix the problem that's causing the eslint error (i.e., remove the line we just added to `src/index.js`), `add` and `commit` the file, and `push` again to GitHub. Watch your workflow run in your browser at <https://github.com/{yourname}/fragments/actions>. Make sure that it passes. Continue this process until you have a clean run (green checkmark).

> [!IMPORTANT]
> One of the most important rules of Continuous Integration (CI) is that you **never leave CI in a broken state**, or put another way, **the source tree must always stay green**. This means that you should avoid pushing code to GitHub that will break CI, and if you do, you need to quickly push a fix so that other developers working on your team don't get blocked with code that can't pass CI. CI is where we all _integrate_ our code changes, so it needs to be kept in working order (imagine a kitchen that's shared by a number of roommates, and one person leaving their dirty dishes everywhere, making it hard for anyone else to cook). It's a good idea to test your changes locally (i.e,. `npm run lint`, etc.) before you `push`, so you can avoid pushing a failing commit to CI.

We now have a simple CI workflow for checking that our code passes ESLint.

## Adding Unit Tests

Our next goal is to have our CI workflow also run unit tests. A [unit test](https://en.wikipedia.org/wiki/Unit_testing) is an automated test that ensures a piece of code (i.e., a **unit** of code) does what it is supposed to do. We'll write lots of unit tests for our microservice, and we'll use GitHub Actions to run them automatically for us whenever we `push` new commits.

### Using Jest for Testing

In order to write automated tests, we need to use a testing framework and test runner. There are lots to choose from, but a popular choice is Facebook's [Jest](https://jestjs.io/). You can use Jest to write tests for the browser or node.

1. [Install Jest](https://jestjs.io/docs/getting-started) by adding it as a development dependency:

```sh
npm install --save-dev jest
```

1. Create an **environment file** in the root of the project for use in our tests: `env.jest`. This file will define environment variables that our application will use when running the microservice during testing, and will be different from how we run it in development or production:

```ini
# env.jest

################################################################################
# Environment variables with values for running the tests. This file can be
# committed to git, since it's only used for testing, and won't contain secrets.
################################################################################

# HTTP Port (defaults to 8080)
PORT=8080

# Disable logs in tests. If you need to see more detail, change this to `debug`
FRAGMENTS_LOG_LEVEL=silent
```

1. Create a [config file for Jest](https://jestjs.io/docs/configuration), `jest.config.js`, in the root of the project. This config file will load our `env.jest` test environment variables and set various options for how the tests will run:

```js
// jest.config.js

// Get the full path to our env.jest file
const path = require('path');
const envFile = path.join(__dirname, 'env.jest');

// Read the environment variables we use for Jest from our env.jest file
require('dotenv').config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.log(
  `Using FRAGMENTS_LOG_LEVEL=${process.env.FRAGMENTS_LOG_LEVEL}. Use 'debug' in env.jest for more detail`
);

// Set our Jest options, see https://jestjs.io/docs/configuration
module.exports = {
  verbose: true,
  testTimeout: 5000,
  // Fail if we don't meet 80% line coverage with our tests
  // NOTE: you can comment this out until you get to 80%, but then
  // leave it on, so you don't ever fall below that threshold.
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
```

1. Update your `eslint.config.mjs` configuration file so that ESLint knows that we're using Jest (otherwise, ESLint will give you lots of lint errors when you use Jest's global functions in your tests). We do this by adding another `env` setting for `jest`:

```js
// eslint.config.mjs

import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  pluginJs.configs.recommended,
];
```

1. Add some **npm scripts** to your `package.json` to run our unit tests. We'll run our tests in various ways:

- `test` - run all tests using our `jest.config.js` configuration [one-by-one](https://jestjs.io/docs/cli#--runinband) vs. in parallel (it's easier to test serially than in parallel). The final `--` means that we'll pass any arguments we receive via the `npm` invocation to Jest, allowing us to run a single test or set of tests. More on this below.
- `test:watch` - same idea as `test`, but don't quit when the tests are finished. Instead, **watch** the files for changes and re-run tests when we update our code (e.g., save a file). This is helpful when you're editing code and want to run tests in a loop as you edit and save the code.
- `coverage` - same idea as `test` but collect test [coverage](https://jestjs.io/docs/cli#--coverageboolean) information, so that we can see which files and lines of code are being tested, and which ones aren't. More on this below.

Here's what your **scripts** will look like:

```json
  "scripts": {
    "test:watch": "jest -c jest.config.js --runInBand --watch --",
    "test": "jest -c jest.config.js --runInBand --",
    "coverage": "jest -c jest.config.js --runInBand --coverage",
    "lint": "eslint \"./src/**/*.js\"",
    "start": "node src/index.js",
    "dev": "FRAGMENTS_LOG_LEVEL=debug nodemon ./src/index.js --watch src",
    "debug": "FRAGMENTS_LOG_LEVEL=debug nodemon --inspect=0.0.0.0:9229 ./src/index.js --watch src"
  }
```

Try running the tests:

```sh
$ npm test

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand --

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /Users/humphd/CCP555/fragments
  14 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 0 matches
  testPathIgnorePatterns: /node_modules/ - 14 matches
  testRegex:  - 0 matches
Pattern:  - 0 matches
```

They should fail because we haven't written any tests yet. Let's fix that next!

### Writing Our First Unit Tests with Jest

Let's add our first unit tests. As we implement our microservice, we're going to try and write a test for **every** part of our code, and **every** condition and case that is described in the [`fragments` spec](../../assignments/README.md).

For example, the spec defines the format for all HTTP Responses ([section 3](../../assignments/README.md#3-responses)). It says that a success response needs to include a `"status": "ok"` property, and an error response needs to include an `"error"` key, with child properties for the error's `"code"` and `"message"`.

1. Add a new module to generate these response, `src/response.js`, and export two functions: `createSuccessResponse()` and `createErrorResponse()`:

```js
// src/response.js

/**
 * A successful response looks like:
 *
 * {
 *   "status": "ok",
 *   ...
 * }
 */
module.exports.createSuccessResponse = function (data) {
  return {
    status: 'ok',
    // TODO ...
  };
};

/**
 * An error response looks like:
 *
 * {
 *   "status": "error",
 *   "error": {
 *     "code": 400,
 *     "message": "invalid request, missing ...",
 *   }
 * }
 */
module.exports.createErrorResponse = function (code, message) {
  // TODO ...
};
```

1. Create a new directory for our unit tests, `tests/unit`. Later we'll create other types of tests, so we put our unit tests in their own `unit/` directory.

2. Now add a new unit test file, `tests/unit/response.test.js`. NOTE: with Jest, the file is named the same as the file it tests, but adds `.test.`; so `response.test.js` is a test for `response.js`. Here is what `tests/unit/response.test.js` should look like:

```js
// tests/unit/response.test.js

const { createErrorResponse, createSuccessResponse } = require('../../src/response');

// Define (i.e., name) the set of tests we're about to do
describe('API Responses', () => {
  // Write a test for calling createErrorResponse()
  test('createErrorResponse()', () => {
    const errorResponse = createErrorResponse(404, 'not found');
    // Expect the result to look like the following
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });

  // Write a test for calling createSuccessResponse() with no argument
  test('createSuccessResponse()', () => {
    // No arg passed
    const successResponse = createSuccessResponse();
    // Expect the result to look like the following
    expect(successResponse).toEqual({
      status: 'ok',
    });
  });

  // Write a test for calling createSuccessResponse() with an argument
  test('createSuccessResponse(data)', () => {
    // Data argument included
    const data = { a: 1, b: 2 };
    const successResponse = createSuccessResponse(data);
    // Expect the result to look like the following
    expect(successResponse).toEqual({
      status: 'ok',
      a: 1,
      b: 2,
    });
  });
});
```

In the tests above, we're using Jest's [`expect()` matchers](https://jestjs.io/docs/expect). These functions provide easy ways to test for various conditions in our test cases. Take a minute to look through the list of all the possible [methods you can call with `expect()`](https://jestjs.io/docs/expect#methods).

NOTE: while you're adding `.js` files to `tests/`, you should update your `lint` script in `package.json` to include this new `tests/` directory along with `src/` when running ESLint:

```json
"lint": "eslint \"./src/**/*.js\" \"tests/**/*.js\"",
```

1. Try running your tests:

```sh
npm test
```

You should see 3 tests run. The `createSuccessResponse()` test should pass, and the `createErrorResponse()` and `createSuccessResponse(data)` tests should fail.

Let's try to get the tests to pass. Because we're going to experiment with our implementation, we'll run our tests in `watch` mode, and re-run them every time we save our file:

```sh
npm run test:watch
```

Now modify the code in `src/response.js` to implement the rest of the `createSuccessResponse(data)` function. We'll copy the contents of `data` into the object we return:

```js
module.exports.createSuccessResponse = function (data) {
  return {
    status: 'ok',
    // Use the spread operator to clone `data` into our object, see:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals
    ...data,
  };
};
```

When you update the code and save the file (`CTRL+s` on Windows/Linux, `CMD+s` on macOS) it should trigger the unit tests to re-run. If you wrote the code in `createSuccessResponse` correctly, you should now have 2 of 3 tests passing.

1. It's your turn. Finish the implementation of `createErrorResponse` and get all 3 of your tests to pass. When you are done, press `CTRL+c` to quit the test runner.

### HTTP Unit Tests with Supertest

Most of our microservice code is focused on HTTP requests and responses, so we're going to need a way to write tests for our REST API endpoints. A common package we use for writing these tests in node is [supertest](https://www.npmjs.com/package/supertest), which is an HTTP assertion module built on top of [superagent](https://github.com/visionmedia/superagent), an HTTP request library.

With `supertest`, we can create HTTP requests to our Express routes, and write assertions about what we expect to get back (e.g., which HTTP response code and what should be in the response body).

The basics of `supertest` are that you pass your Express server's `app` object to `supertest`, and then make an HTTP request. The `response` you get back let's you assert various things about the headers, body, etc.

1. Install the `supertest` module as a **development dependency** (we won't use this in production):

```sh
npm install --save-dev supertest
```

1. Create a new unit test file to test your health check route: `tests/unit/health.test.js`. In it, we'll write multiple, small tests to confirm that various aspects of our health check route work the way we expect:

```js
// tests/unit/health.test.js

const request = require('supertest');

// Get our Express app object (we don't need the server part)
const app = require('../../src/app');

// Get the version and author from our package.json
const { version, author } = require('../../package.json');

describe('/ health check', () => {
  test('should return HTTP 200 response', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('should return Cache-Control: no-cache header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['cache-control']).toEqual('no-cache');
  });

  test('should return status: ok in response', async () => {
    const res = await request(app).get('/');
    expect(res.body.status).toEqual('ok');
  });

  test('should return correct version, githubUrl, and author in response', async () => {
    const res = await request(app).get('/');
    expect(res.body.author).toEqual(author);
    expect(res.body.githubUrl.startsWith('https://github.com/')).toBe(true);
    expect(res.body.version).toEqual(version);
  });
});
```

1. Try running your tests again:

```sh
$ npm test

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand --

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/response.test.js
  API Responses
    ✓ createErrorResponse() (1 ms)
    ✓ createSuccessResponse()
    ✓ createSuccessResponse(data)

 FAIL  tests/unit/health.test.js
  ● Test suite failed to run

    TypeError: Cannot read properties of undefined (reading 'match')

      12 | // get from a user is valid and something we can trust. See:
      13 | // https://github.com/awslabs/aws-jwt-verify#cognitojwtverifier-verify-parameters
    > 14 | const jwtVerifier = CognitoJwtVerifier.create({
         |                                        ^
      15 |   userPoolId: process.env.AWS_COGNITO_POOL_ID,
      16 |   clientId: process.env.AWS_COGNITO_CLIENT_ID,
      17 |   // We expect an Identity Token (vs. Access Token)

      at Function.parseUserPoolId (node_modules/aws-jwt-verify/dist/cjs/cognito-verifier.js:73:34)
      at new CognitoJwtVerifier (node_modules/aws-jwt-verify/dist/cjs/cognito-verifier.js:59:39)
      at Function.create (node_modules/aws-jwt-verify/dist/cjs/cognito-verifier.js:86:16)
      at Object.<anonymous> (src/auth.js:14:40)
      at Object.<anonymous> (src/app.js:14:23)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.439 s, estimated 1 s
Ran all test suites.
```

Our tests are failing. Can you spot the reason why? Reading failed test output is a skill you need to practice and get good at. It can take time to learn what to pay attention to, and what you can likely ignore.

In our case, the error message above isn't very helpful: `TypeError: Cannot read properties of undefined (reading 'match')`; but reading the code below it we can see that it's failing in our call to `CognitoJwtVerifier.create()`, which is using the environment variables `process.env.AWS_COGNITO_POOL_ID` and `process.env.AWS_COGNITO_CLIENT_ID`.

This actually makes some sense. Our tests aren't using `src/index.js` to load our Express app, which is where we load our `.env` file (with those variables), and instead uses the `env.jest` environment file, which doesn't include them. Therefore, our app is expecting to be able to use these AWS `string` values, and when they are `undefined`, it crashes trying to call the `.match()` method.

We're going to need to improve this situation before we can move forward. We'll do that in two ways. First, we'll print a better error message when we're missing environment variables, making our code easier to maintain and debug. Second, we'll write code to allow us to simulate authentication and authorization in tests without actually having to use Cognito at all.

### Crashing with Better Error Messages

Our Cognito Passport.js code in `src/auth.js` expects both `AWS_COGNITO_POOL_ID` and `AWS_COGNITO_CLIENT_ID` to be defined in the environment. If they aren't, our program is going to behave in undefined ways. We just saw that it will crash with an error message that contains very little details, making it hard to debug the cause if you don't understand the code really well.

It's going to sound odd to say this, but the best thing you can do in a situation like this is to [crash immediately and provide a useful clue about what happened](https://blog.heroku.com/best-practices-nodejs-errors). We don't want a server to run in an undefined state. It's better to crash and log the error, which someone can debug and fix. In our case, we need to check that the variables we expect to use are defined, and if they aren't, `throw` an `Error` with a more useful error message.

1. Let's modify `src/auth.js` so that we crash with a message indicating that these environment variables are missing:

```js
// modification to src/auth.js

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const logger = require('./logger');

// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID');
}
...
```

In your `.env` file, try commenting out one of the `AWS_COGNITO_*` variables (add a `#` in front of them) and running your server. It should crash with our error message about the variables missing:

```sh
$ npm start

> fragments@0.0.1 start
> node src/index.js

{"level":60,"time":1642790744289,"pid":28264,"hostname":"emone.localdomain","err":{"type":"Error","message":"missing env vars: no authorization configuration found","stack":"Error: missing env vars: no authorization configuration found\n    at Object.<anonymous> (/Users/humphd/Seneca/CCP555/fragments/src/auth/index.js:11:9)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)\n    at Module.load (node:internal/modules/cjs/loader:981:32)\n    at Function.Module._load (node:internal/modules/cjs/loader:822:12)\n    at Module.require (node:internal/modules/cjs/loader:1005:19)\n    at require (node:internal/modules/cjs/helpers:102:18)\n    at Object.<anonymous> (/Users/humphd/Seneca/CCP555/fragments/src/app.js:14:23)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)"},"origin":"uncaughtException","msg":"uncaughtException"}
/Users/humphd/Seneca/CCP555/fragments/src/index.js:11
  throw err;
  ^

Error: missing env vars: no authorization configuration found
    at Object.<anonymous> (/Users/humphd/Seneca/CCP555/fragments/src/auth/index.js:11:9)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/Users/humphd/Seneca/CCP555/fragments/src/app.js:14:23)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
```

Now we have a good setup for development, testing, and production cases, where our configurations need to be different.

Before you continue, fix your `.env` file to uncomment your `AWS_COGNITO_*` variables, and make sure your server starts.

1. Re-run the tests, and compare the failure now to the one we saw above:

```sh
$ npm test

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand --

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/response.test.js
  API Responses
    ✓ createErrorResponse() (1 ms)
    ✓ createSuccessResponse()
    ✓ createSuccessResponse(data)

 FAIL  tests/unit/health.test.js
  ● Test suite failed to run

    missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID

      11 | // We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
      12 | if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
    > 13 |   throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID');
         |         ^
      14 | }
      15 |
      16 | // Create a Cognito JWT Verifier, which will confirm that any JWT we

      at Object.<anonymous> (src/auth.js:13:9)
      at Object.<anonymous> (src/app.js:14:23)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.425 s, estimated 1 s
Ran all test suites.
```

This is way, way easier to understand and debug! By actively taking control of what happens when data is invalid or missing, we're investing in the maintainability of our code. Whoever ends up deploying and running this code in production will thank you when they forget to add these variables.

Writing cloud-ready software means thinking about how your code behaves in the ideal case as well as the failure cases. How your code crashes is just as important as how it runs, because it **will** eventually crash, and you need to be able to figure out why and fix it quickly.

### Simplifying Authentication in Testing and Development

We've improved our situation by making it more clear what's wrong; but we haven't actually fixed the problem yet. We still can't run our tests without authenticating against Cognito. As you know from Lab 2, OAuth2 authentication is a complex flow that requires multiple redirects in a browser. While not impossible, it's going to be tricky to do it in automated tests (if you're interested in exploring how you might automate tests involving browsers, see [Using Jest with Playwright](https://playwright.tech/blog/using-jest-with-playwright) and the [Playwright](https://playwright.dev/)).

A better approach for us is to add a second and simpler Passport.js authentication **Strategy**, which still allows our code to require authenticated users, but doesn't force us to use such a complex authentication flow. When we're testing our units of code, we don't need to worry about every aspect of the program: it's enough that authentication works without worrying about the specific details during a test of a particular HTTP endpoint.

One common approach is to use [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication), where a username and password are [included in a request's `Authorization` header](https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side). With Basic Authentication, we can eliminate the need for a Cognito User Pool and Authentication UI/domain, and hard-code a few accounts into our test setup instead.

We'll put our test user accounts into an [`.htpasswd` file](https://httpd.apache.org/docs/2.4/programs/htpasswd.html). These accounts won't ever be used in production, only during testing. You can create any users you like (i.e., the username and password don't matter), but we need to make at least two users so that we can test logging in as different users. For example:

| Username                           | Password       |
| ---------------------------------- | -------------- |
| <test-user1@fragments-testing.com> | test-password1 |
| <test-user2@fragments-testing.com> | test-password2 |

We could create this file with the [Apache `htpasswd` utility](https://httpd.apache.org/docs/2.4/programs/htpasswd.html), or using the [htpasswd node module](https://github.com/gevorg/htpasswd), which will work on any OS (i.e., easier to run cross-platform). We can use the [Node.js Package Runner `npx`](https://nodejs.dev/learn/the-npx-nodejs-package-runner) to download and run a node module in a single step.

1. Add two users to a new file, `tests/.htpasswd`:

```sh
npx htpasswd -cbB tests/.htpasswd test-user1@fragments-testing.com test-password1
npx htpasswd -bB tests/.htpasswd test-user2@fragments-testing test-password2
```

You should now have a `tests/.htpasswd` file, and it will look something like this, with the passwords you entered above encrypted using [bcrypt](https://en.wikipedia.org/wiki/Bcrypt):

```text
test-user1@fragments-testing.com:$2a$05$JRnVLsbKlMTOHXgMjnc56.QiYOVJa/vt.InXLmq9UIEDcAesoAyPW
test-user2@fragments-testing:$2a$05$MQzeikyE1XyVN3UMdU1WROA6XQYOTV52zivwfY5H513kLRCD.TxTy
```

1. Install two new node modules for working with Basic Authentication in Passport.js, [http-auth](https://www.npmjs.com/package/http-auth) and [http-auth-passport](https://www.npmjs.com/package/http-auth-passport):

```sh
npm install --save http-auth http-auth-passport
```

Now we need to [refactor](https://en.wikipedia.org/wiki/Code_refactoring) our `src/auth.js` file so that it works for both Cognito JWTs as well as HTTP Basic Authentication.

1. Begin by creating the following file and directory structure (NOTE: we already have the `src/auth.js` file, but the rest is new):

```
src/
├─ auth.js
├─ auth/
│  ├─ cognito.js
│  ├─ basic-auth.js
│  ├─ index.js
...
```

We're going to separate our Cognito and Basic Authentication strategies into two different files: `cognito.js` and `basic-auth.js`. A third file, `src/auth/index.js` will be used to figure out which of the two strategies to use at runtime, based on our environment variables.

1. Copy and paste all of the code in `src/auth.js` into `src/auth/cognito.js` (or use `git mv src/auth.js src/auth/cognito.js`). Make sure you update any relative file path `require()` calls that reference files in our project so that the correct directory level is used (i.e., we're now one level deeper in the file tree). Here is what it will look like:

```js
// src/auth/cognito.js

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const logger = require('../logger');

// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID, AWS_COGNITO_CLIENT_ID');
}

// Log that we're using Cognito
logger.info('Using AWS Cognito for auth');

// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust. See:
// https://github.com/awslabs/aws-jwt-verify#cognitojwtverifier-verify-parameters
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  // We expect an Identity Token (vs. Access Token)
  tokenUse: 'id',
});

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
// You can try this yourself using:
// curl https://cognito-idp.us-east-2.amazonaws.com/<user-pool-id>/.well-known/jwks.json
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for the Bearer Token
  // in the Authorization header, then verify that with our Cognito JWT Verifier.
  new BearerStrategy(async (token, done) => {
    try {
      // Verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');

      // Create a user, but only bother with their email
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });

module.exports.authenticate = () => passport.authenticate('bearer', { session: false });
```

1. Add our new Basic Authentication strategy in `src/auth/basic-auth.js`. It needs to use the same module pattern that we used in `cognito.js`, namely, export both a `strategy()` and `authenticate()` function, so that we can swap one module for the other at runtime:

```js
// src/auth/basic-auth.js

// Configure HTTP Basic Auth strategy for Passport, see:
// https://github.com/http-auth/http-auth-passport

const auth = require('http-auth');
const passport = require('passport');
const authPassport = require('http-auth-passport');
const logger = require('../logger');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

// Log that we're using Basic Auth
logger.info('Using HTTP Basic Auth for auth');

module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for a
  // username/password pair in the Authorization header.
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );

module.exports.authenticate = () => passport.authenticate('http', { session: false });
```

1. Last, let's write `src/auth/index.js` in order to pick between our two strategies, depending on which environment variables are defined. This module won't define any of its own code; rather, it will delegate to one of the two modules we just wrote and forward that to the caller. If the AWS Cognito variables are defined, we'll prefer using Cognito JWTs. If an `.htpasswd` file path is defined, we'll use Basic Authentication. If neither of these is true, we'll throw an error:

```js
// src/auth/index.js

// Make sure our env isn't configured for both AWS Cognito and HTTP Basic Auth.
// We can only do one or the other.  If your .env file contains all 3 of these
// variables, something is wrong.  It should have AWS_COGNITO_POOL_ID and
// AWS_COGNITO_CLIENT_ID together OR HTPASSWD_FILE on its own.
if (
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.HTPASSWD_FILE
) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

// Prefer Amazon Cognito (production)
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  module.exports = require('./cognito');
}
// Also allow for an .htpasswd file to be used, but not in production
else if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
}
// In all other cases, we need to stop now and fix our config
else {
  throw new Error('missing env vars: no authorization configuration found');
}
```

> [!IMPORTANT]
> A key idea we are using here is **app config via environment variables**. We are going to allow our server to be configured with one of two different auth providers, but only one is allowed at runtime. You have to make sure that you provide the correct environment variables for your chosen auth provider. Many students struggle to get this right, so make sure you understand what's happening here, since you'll need to do this correctly in many scenarios in the future.

1. We can delete our `src/auth.js` file now, since we won't be using it anymore. We need to do this via git: just like we `add` files to git and `commit`, when we delete something, we need to `rm` and `commit`. NOTE: the `-f` flag below is useful if you want to _force_ the delete to happen, even if there are modifications):

```sh
$ git rm src/auth.js -f
rm 'src/auth.js'
```

1. Try running your tests again. They should fail because we don't have any authorization configuration set for our tests yet, which we'll fix in a minute. Note the error message we get:

```sh
$ npm test

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand --

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/response.test.js
  API Responses
    ✓ createErrorResponse() (1 ms)
    ✓ createSuccessResponse()
    ✓ createSuccessResponse(data)

 FAIL  tests/unit/health.test.js
  ● Test suite failed to run

    missing env vars: no authorization configuration found

       9 | // In all other cases, we need to stop now and fix our config
      10 | else {
    > 11 |   throw new Error('missing env vars: no authorization configuration found');
         |         ^
      12 | }
      13 |

      at Object.<anonymous> (src/auth/index.js:11:9)
      at Object.<anonymous> (src/app.js:14:23)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.405 s, estimated 1 s
Ran all test suites.
```

1. Try running your server normally, like you did in Lab 2, to make sure the existing Cognito strategy is still working, where we do define the Cognito variables in `.env`:

```sh
$ npm run dev

> fragments@0.0.1 dev
> FRAGMENTS_LOG_LEVEL=debug nodemon ./src/index.js --watch src

[nodemon] 2.0.15
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node ./src/index.js`
[1642717658142] INFO (16503 on localdomain): Server started
    port: 8080
[1642717658295] INFO (16503 on localdomain): Cognito JWKS cached
```

### Configure Unit Tests to Use Basic Auth

Let's update our tests so that we use Basic Authentication when we run Jest. To do that, we need to define the environment variable `HTPASSWD_FILE` with a path to our `.htpasswd` file. We don't want to do this in production or development (currently), only in tests.

1. Add the `HTPASSWD_FILE` variable to your `env.jest` environment file:

```ini
# env.jest

# HTTP Port (defaults to 8080)
PORT=8080

# Disable logs in tests. If you need to see more detail, change this to `debug`
FRAGMENTS_LOG_LEVEL=silent

# .htpasswd file to use in testing
HTPASSWD_FILE=tests/.htpasswd
```

> [!TIP]
> Notice how we have a custom env file, `env.jest`, which we can use to easily configure out app for testing. You can use this same technique to create other custom `.env` setups. For example: `env.cognito` and `env.basic-auth`. Each of these files can be pre-configured to run in the correct way for a given auth provider. When you want to use one or the other, you simply copy the file to your `.env` (e.g., to use Cognito you could do `cp env.cognito .env`). Because these can contain secrets, be careful about putting them in git (e.g., add these files to your `.gitignore` file).

1. Try running your tests again:

```sh
$ npm test

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand --

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/response.test.js
  API Responses
    ✓ createErrorResponse() (1 ms)
    ✓ createSuccessResponse()
    ✓ createSuccessResponse(data)

 PASS  tests/unit/health.test.js
  / health check
    ✓ should return HTTP 200 response (12 ms)
    ✓ should return Cache-Control: no-cache header (2 ms)
    ✓ should return status: ok in response (1 ms)
    ✓ should return correct version, githubUrl, and author in response (1 ms)

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.369 s, estimated 1 s
Ran all test suites.
```

This time everything should pass!

### Use Basic Auth in Unit Tests

Let's write one more test to prove that our Basic Authentication strategy is actually working. In Lab 2 we added a very basic implementation of the `GET /v1/fragments` route, which requires a user to be authenticated. At this point, all it does is return an empty array. The code looked like this:

```js
// src/routes/index.js

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all so you have to be authenticated in order to access.
 */
router.use(`/v1`, authenticate(), require('./api'));

////////////////////////////////////////////////////////////////////

// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working
  res.status(200).json({
    status: 'ok',
    fragments: [],
  });
};
```

We should be able to write two new test cases in order to test this code: 1) an authenticated request; 2) an unauthenticated request. In both cases, the HTTP responses should match what we expect.

1. Add a new unit test file, `tests/unit/get.test.js`, which will test our `src/routes/api/get.js` file. Here is what it should look like (pay attention to how we're setting the username and password using `.auth()` in the second and third cases):

```js
// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
```

1. Re-run your tests:

```sh
$ npm test

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand --

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/health.test.js
  / health check
    ✓ should return HTTP 200 response (8 ms)
    ✓ should return Cache-Control: no-cache header (2 ms)
    ✓ should return status: ok in response (3 ms)
    ✓ should return correct version, githubUrl, and author in response (1 ms)

 PASS  tests/unit/get.test.js
  GET /v1/fragments
    ✓ unauthenticated requests are denied (8 ms)
    ✓ incorrect credentials are denied (2 ms)
    ✓ authenticated users get a fragments array (12 ms)

 PASS  tests/unit/response.test.js
  API Responses
    ✓ createErrorResponse() (1 ms)
    ✓ createSuccessResponse()
    ✓ createSuccessResponse(data)

Test Suites: 3 passed, 3 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        0.472 s, estimated 1 s
Ran all test suites.
```

1. You could also run a single test file by passing all, or part of its name:

```sh
$ npm test get.test.js

> fragments@0.0.1 test
> jest -c jest.config.js --runInBand -- "get.test.js"

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/get.test.js
  GET /v1/fragments
    ✓ unauthenticated requests are denied (11 ms)
    ✓ incorrect credentials are denied (2 ms)
    ✓ authenticated users get a fragments array (12 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.316 s, estimated 1 s
Ran all test suites matching /get.test.js/i.
```

The same trick works with `npm run test:watch get.test.js`. As you add more files and tests, remember that you can always pass a test name and zero-in on a single test vs. running everything.

### Examining Test Coverage

1. When we added Jest earlier, we created a number of **npm scripts** to run it. One of those was the `coverage` script. Try running it now:

```sh
$ npm run coverage

> fragments@0.0.1 coverage
> jest -c jest.config.js --runInBand --coverage

Using FRAGMENTS_LOG_LEVEL=silent. Use 'debug' in env.jest for more detail
 PASS  tests/unit/get.test.js
  GET /v1/fragments
    ✓ unauthenticated requests are denied (10 ms)
    ✓ incorrect credentials are denied (2 ms)
    ✓ authenticated users get a fragments array (12 ms)

 PASS  tests/unit/health.test.js
  / health check
    ✓ should return HTTP 200 response (5 ms)
    ✓ should return Cache-Control: no-cache header (2 ms)
    ✓ should return status: ok in response (2 ms)
    ✓ should return correct version, githubUrl, and author in response (2 ms)

 PASS  tests/unit/response.test.js
  API Responses
    ✓ createErrorResponse() (1 ms)
    ✓ createSuccessResponse()
    ✓ createSuccessResponse(data)

-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   83.87 |       40 |      75 |    83.6 |
 src               |   78.78 |       20 |      50 |   78.78 |
  app.js           |      76 |        0 |       0 |      76 | 41,55-63
  logger.js        |      75 |       50 |     100 |      75 | 7
  response.js      |     100 |      100 |     100 |     100 |
 src/auth |   78.57 |       60 |     100 |   76.92 |
  basic-auth.js    |   88.88 |       50 |     100 |    87.5 | 10
  index.js         |      60 |     62.5 |     100 |      60 | 3,11
 src/routes        |     100 |      100 |     100 |     100 |
  index.js         |     100 |      100 |     100 |     100 |
 src/routes/api    |     100 |      100 |     100 |     100 |
  get.js           |     100 |      100 |     100 |     100 |
  index.js         |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
Test Suites: 3 passed, 3 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        0.62 s, estimated 1 s
Ran all test suites.
```

This ran our tests, but it also collected **coverage** information: which files and lines of code were run. It gives us a simple text report after our test results that lists all of the files affected during testing (i.e., pay attention to which files _aren't_ included) and what percentage of statements, branches, functions, and lines were touched during the tests. It also includes which lines have no coverage at all. For example, lines 3 and 11 in `src/auth/index.js`. NOTE: your lines will probably be different than mine due to whitespace and other differences in our implementations.

You can also see a much more elaborate web version of the report by opening the file `coverage/lcov-report/index.html` in your browser (the `coverage/` directory will have been created when you ran the command above).

As we write more code, we can use coverage data to help us understand which parts of our project are not being tested yet. For example, we might add an `if/else` statement in a function, and only have a test for the `if` case, completely missing the `else` branch. Without coverage data, it's hard to know what is and isn't being tested. You can have lots of tests, but are they testing the right things?

Most projects will almost never get to 100% coverage. For example, we said above that we won't run our Cognito authentication strategy in tests. This means that none of our Cognito code is being tested (notice that `src/auth/cognito.js` is missing from the table above).

Do your best to increase vs. decrease test coverage, but don't get obsessed about getting to 100%. Just like you hopefully are aiming for an A in this course, aim for something in the 80-100% range for your test coverage, too!

### Improving Test Coverage by Adding More Tests

In the coverage report above, you can see that `src/app.js` is not covering line 41:

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   83.87 |       40 |      75 |    83.6 |
 src               |   78.78 |       20 |      50 |   78.78 |
  app.js           |      76 |        0 |       0 |      76 | 41,55-63
```

For me, this means this function in `src/app.js` isn't being hit during our test run:

```js
// Add 404 middleware to handle any requests for resources that can't be found can't be found
app.use((req, res) => {
  // Pass along an error object to the error-handling middleware
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});
```

When you notice a hole like this, ask yourself whether you could create a test that would cause your test run to hit it. In this case, we can.

1. Using what you learned above, add a new test file, `tests/unit/app.test.js`, and write an HTTP unit test using `supertest` to cover this `404` handler (i.e., write a test that causes a `404` to occur). When your test is finished and passing, re-run your coverage report and make sure that the coverage for `app.js` has improved, and this line is no longer in the list of uncovered lines. Take a screenshot of the new coverage report with the 404 handler included (i.e., not listed in the uncovered lines).

### Running Unit Tests in CI

At the beginning of this lab, we wrote a GitHub Actions Workflow for Continuous Integration. Currently, all it does is check that our code is passing ESLint whenever we `push` to the `main` branch. Let's extend it now so that it also run our unit tests every time we `push`.

1. Add another `Job` to your `.github/workflows/ci.yml` file. It's going to be very similar to our ESLint Job, except it will run our unit tests vs. linter as the final step:

```yml
# modifications to .github/workflows/ci.yml

jobs:
  lint:
    name: ESLint
    runs-on: ubuntu-latest
    steps:
      - name: Check out code
        uses: actions/checkout@v6

      - name: Setup node
        uses: actions/setup-node@v6
        with:
          node-version: 'lts/*'
          cache: 'npm'

      - name: Install node dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Check out code
        uses: actions/checkout@v6

      - name: Setup node
        uses: actions/setup-node@v6
        with:
          node-version: 'lts/*'
          cache: 'npm'

      - name: Install node dependencies and run Tests
        # There are two ways we could do this:
        #
        # 1. Call `npm ci` followed by `npm test` like so (NOTE: the use of | and -):
        # run: |
        # - npm install
        # - npm test
        #
        # 2. Use `install-ci-test` to do it in a single command, see https://docs.npmjs.com/cli/v8/commands/npm-install-ci-test
        # run: npm install-ci-test
        run: npm install-ci-test
```

We're writing our `lint` and `unit-tests` as separate **Jobs** so that they can be run in parallel instead of one having to wait on the other. You could also have written one long job with an additional step at the end for the unit tests. Both methods will work.

1. Now you need to `add` and `commit` all the files you've worked on to git. A few notes about what to include and what not to: normally we don't put `.env` files in git, but your `env.jest` file is OK to include in git because we need it for tests and it won't contain secrets. Similarly, the `tests/.htpasswd` file contains usernames and passwords; however, these are fake credentials used only during testing. As such, both files are fine to include in git. The `.env` file should **NOT** be included in git because it will contain AWS credentials and secrets. Also, the `coverage` folder should **NOT** be included in git because it's a **generated** folder (i.e., we don't need to store it because we can always re-create it with `npm run coverage`). Everything else in `src/` and `tests/` can get added to git:

```sh
$ git status
...check which files need to be updated/added
$ git add file1 file2 dir1 dir2
$ git commit -m "...your commit message..."
$ git push origin main
```

1. In your browser, navigate to your `fragments` GitHub repo and click on the **Actions** tab, which will take you to <https://github.com/{yourname}/fragments/actions>.

You should see your latest commit in the list of workflow runs. Click it. You should now see the `ci.yml` workflow with both an **ESLint** item **and** a **Unit Tests** item within it. Click both **ESLint** and **Unit Tests** to see all of the **Steps** for each **Job**. Try clicking on each of the **Steps** (e.g., **Setup node**, **Run ESLint**, **Install node dependencies and run tests**, etc) to see what happened.

Make sure your CI workflow run is green. If it's failing, make fixes locally, `add` and `commit` your changes, and then `push` to your GitHub repo again.

### Break and Fix your Unit Tests

Before you end the lab, I want to make sure that you know how to identify and fix a broken CI unit test. If you haven't already had a failed CI unit test run, let's create one manually right now.

1. In `tests/unit/get.test.js`, let's modify the first unit test so that it expects the wrong HTTP response code: instead of expecting a `401`, let's have it expect `500` (i.e., change `401` to `500` in the following test):

```js
// If the request is missing the Authorization header, it should be forbidden
test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(500));
```

1. Save the file, and make sure the tests fail locally (i.e., run `npm test` and see that it fails). Once you're satisfied that you've broken the test, `add` and `commit` it to git, and `push` to your GitHub repo. Watch your CI workflow run in **Actions**, and when it fails, take a screenshot (you'll need this for submission).

2. Now, fix the test locally so that it expects `401` instead of `500`. Re-run your tests locally (`npm test`) and make sure it passes. Once you're satisfied that you've fixed the test, `add` and `commit` it to git, and `push` to your GitHub repo. Watch your CI workflow run in your browser, and when it passes, take a screenshot (you'll need this for submission).

### Refactor to Use the `response.js` Functions

1. As a final task, rewrite all of your HTTP responses to use the `createSuccessResponse()` and `createErrorResponse()` functions in `src/response.js`. This means updating:

- your health check route in `src/routes/index.js`
- your default error handler in `src/app.js`
- your code for the `GET /v1/fragments` route in `src/routes/api/get.js`

1. After you make these updates, re-run your tests and make sure everything is passing locally.

2. Finally, you should `add` and `commit` everything to git, and `push` to GitHub. Make sure the CI workflow run for your final push of Lab 3 is green.

## Submission

In Blackboard, please submit the following:

- Link to your `fragments` GitHub repo's GitHub Actions. Your failed and passing CI runs should all be visible.
- Screenshots:
  - Screenshot of your CI workflow failing ESLint
  - Screenshot of your CI workflow failing one or more Unit Tests
  - Screenshot of your CI workflow passing ESLint
  - Screenshot of your CI workflow passing all Unit Tests
  - Screenshot of your test coverage report, showing the app.js 404 handler being covered. Open the file `coverage/lcov-report/src/app.js.html` in your browser to show the lines of code being hit (green) by the tests, and those being missed (red).
  - Screenshot of your current account costs in the AWS Console
