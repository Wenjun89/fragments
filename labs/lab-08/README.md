# Lab 8

In this lab we will extend our development environment to include [integration tests](https://en.wikipedia.org/wiki/Integration_testing) using a tool called [Hurl](https://hurl.dev/). Previously we did something similar with [unit tests](https://en.wikipedia.org/wiki/Unit_testing), which focused on testing individual functions and modules. [Integration tests](https://en.wikipedia.org/wiki/Integration_testing) makes sure that multiple components in a system work together.

We will also explore how to use [docker compose](https://docs.docker.com/compose/) to create complex testing environments, and use it to mock AWS services in local development.

When you are done this lab, you will have a good foundation for modifying your `fragments` microservice to work with AWS managed services in the following weeks.

> [!WARNING]
> A number of steps in this lab assume that you are running a Unix shell (e.g., bash). If you are on Windows, consider using WSL2, a Linux VM, an EC2 instance, etc. You need to be able to work in a Unix environment when doing local development.

## Integration Testing with Hurl

Throughout our development of the `fragments` server, we've often used [curl](https://curl.se/) to quickly write manual tests. For example, the assignment shows an example of accessing the health check route:

```sh
$ curl -i https://fragments-api.com/

HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: application/json; charset=utf-8

{"status":"ok","author":"David Humphrey","githubUrl":"https://github.com/humphd/fragments","version":"0.5.3"}
```

[curl](https://curl.se/) is an industry standard way to work with HTTP and other network protocols from the command line. We prefer it to more graphical tools because it is widely supported (every OS in the world runs [curl](https://curl.se/)) and also because we can easily use it in automation scripts and tests.

Many tools embed [curl](https://curl.se/) (i.e., [libcurl](https://curl.se/libcurl/)) to add network transfer support. One such tool that we're going to learn is [Hurl](https://hurl.dev/).

### 1. Hurl

[Hurl](https://hurl.dev/) is an open source, cross-platform command line tool for writing simple plain text files and executing them with [curl](https://curl.se/). It was created by developers at [Orange Telecom](https://opensource.orange.com/en/orange-open-source-projects-on-github/) in France, to help them do their own network testing. We'll use it to write network test cases in a curl-like syntax, without having to write any code. This no-code approach means that we can easily use it with any language or framework that uses HTTP.

Hurl is written in [Rust](https://www.rust-lang.org/) and is extremely fast to run (great for testing), quick to learn, and very expressive for describing common network requests and responses. As you work through this lab, you should keep a copy of the [Hurl Documentation](https://hurl.dev/docs/) open in your browser for reference.

> [!NOTE] Seneca faculty and students have contributed code to hurl.

#### 1.1 Install hurl

Begin by [installing hurl](https://hurl.dev/docs/installation.html) on your local machine. You can install [Hurl](https://hurl.dev/) as a stand-alone tool, or as part of your node.js project [using `npm`](https://www.npmjs.com/package/@orangeopensource/hurl). We'll use the `npm` method, since we're working on a node.js project. When you're done, your `package.json` scripts will be able to run the `hurl` command:

```sh
npm install --save-dev @orangeopensource/hurl
```

In your `package.json` file, add a new `npm` script to run our integration tests:

```json
...
"scripts": {
  ...
  "test:integration": "hurl --test --glob \"tests/integration/**/*.hurl\""
},
...
```

Now, you can run [Hurl](https://hurl.dev/) and our integration tests using:

```sh
npm run test:integration
```

Before that will work, we need to add some integration tests in the form of `.hurl` files.

#### 1.2 Your First .hurl File

> [!NOTE]
> You should consider installing the [Hurl VSCode Syntax Highlighting extension](https://marketplace.visualstudio.com/items?itemName=JacobPfeifer.pfeifer-hurl) to help you while authoring your `.hurl` files

1. Next, create the directory `tests/integration` in your `fragments` microservice:

   ```sh
   cd fragments
   mkdir -p tests/integration
   ```

2. Our first integration test will be to make sure that our server returns the expected health check response. Create a file named `health-check.hurl`:

   ```sh
   touch tests/integration/health-check.hurl
   ```

3. Our `health-check.hurl` test needs to make an HTTP `GET` request to our server running on `http://localhost:8080`. If we were using [curl](https://curl.se/), we'd write this as `curl http://localhost:8080`. In a [`.hurl` file](https://hurl.dev/docs/hurl-file.html) we write it like this:

   ```ini
   # Health Check Test
   GET http://localhost:8080
   ```

   Hurl files use `#...` style comments, like many of the other files we've been using. Don't be afraid to add comments to your tests.

4. To test that your `.hurl` file works, we run our integration tests. Let's try running it **without** having our `fragments` server running:

   ```sh
   $ cd fragments
   $ npm run test:integration
    tests/integration/health-check.hurl: RUNNING [1/1]
    error: Http Connection
    --> tests/integration/health-check.hurl:2:5
    |
    2 | GET http://localhost:8080
    |     ^^^^^^^^^^^^^^^^^^^^^ (7) Failed to connect to localhost port 8080: Connection refused
    |

    tests/integration/health-check.hurl: FAILURE
    --------------------------------------------------------------------------------
    Executed:  1
    Succeeded: 0 (0.0%)
    Failed:    1 (100.0%)
    Duration:  6ms
   ```

   Here we can see what a failing test looks like.

5. Let's start our server and re-run it:

   ```sh
   $ cd fragments
   $ npm start
   ...
   $ npm run test:integration
   tests/integration/health-check.hurl: RUNNING [1/1]
   tests/integration/health-check.hurl: SUCCESS
   --------------------------------------------------------------------------------
   Executed:  1
   Succeeded: 1 (100.0%)
   Failed:    0 (0.0%)
   Duration:  20ms
   ```

   And now we see what a passing test looks like.

6. Let's expand our test. So far we're only checking that the request succeeds, but we can add all kinds of [assertions](https://hurl.dev/docs/asserting-response.html) to make sure that the response happens like we expect. Modify `tests/integration/health-check.hurl` to check the protocol, version, status, and `Cache-Control` header value returned:

   ```sh
   # Health Check Test
   GET http://localhost:8080

   # We should get back an HTTP 1.1 200 response
   HTTP/1.1 200
   # We should get back a non-cacheable response (cache-control header)
   Cache-Control: no-cache
   ```

   Now try re-running your test, and make sure it passes.

7. We can go further and require that the response body, headers, etc. match certain requirements. We call these [assertions](https://hurl.dev/docs/asserting-response.html#asserts), and we write them as [predicates](https://hurl.dev/docs/asserting-response.html#predicates). Hurl has many predicates we can use, from equality and range checks to contains and includes, or even regex with matches. We can also query JSON data using [JSONPath assertions](https://hurl.dev/docs/asserting-response.html#jsonpath-assert). In a [JSONPath](https://goessner.net/articles/JsonPath/) expression, the `$` represents the outer root member (e.g., the top-level Object or Array in the JSON response).

   In our case, the JSON we get back will look something like this:

   ```json
   {
     "status": "ok",
     "author": "David Humphrey",
     "githubUrl": "https://github.com/humphd/fragments",
     "version": "0.5.3"
   }
   ```

   We can write some [JSONPath assertions](https://hurl.dev/docs/asserting-response.html#jsonpath-assert) to test all the values in the response that we expect:

   ```sh
   # Health Check Test
   GET http://localhost:8080

   # We should get back an HTTP 1.1 200 response
   HTTP/1.1 200
   # We should get back a non-cacheable response (cache-control header)
   Cache-Control: no-cache

   # Extra checks to perform against the response
   [Asserts]
   # We expect to get back a JSON response with { "status": "ok", ... }
   jsonpath "$.status" == "ok"
   # We expect to get back a JSON response with { ..., "author": "..." }
   jsonpath "$.author" isString
   # We expect to get back a JSON response with { ..., "githubUrl": "..." }
   jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
   # We expect to get back a JSON response with { ..., "version": "x.y.z" }
   jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
   ```

   Here we've used `==` for equality checking, `isString` to check for any string value, and `matches /.../` to check for regular expressions.

   Try re-running your test, and make sure it passes.

8. Now it's your turn to try writing a test. Add a new test to make sure that you get back an HTTP `404` response if you request a route that doesn't exist (e.g., `http://localhost:8080/no-such-route`). Create a new file, `tests/integration/404.hurl` test that confirms this works as expected.

#### 1.3 Hurl and Authentication

Many of our routes require authentication. In testing, we have to provide a **username** and **password** via HTTP Basic Authentication in the `Authorization` header. For example, to create a new fragment for a user with [curl](https://curl.se/), we might write the following:

```sh
$ curl -i \
  -X POST \
  -u user1@email.com:password1 \
  -H "Content-Type: text/plain" \
  -d "This is a fragment" \
  https://fragments-api.com/v1/fragments

HTTP/1.1 201 Created
Location: https://fragments-api.com/v1/fragments/vBOV-xf6MnHP0Epw-0BVP
Content-Type: application/json; charset=utf-8
Content-Length: 187

{
  "status": "ok",
  "fragment": {
    "id": "vBOV-xf6MnHP0Epw-0BVP",
    "created": "2021-11-08T01:04:46.071Z",
    "updated": "2021-11-08T01:04:46.073Z",
    "ownerId": "0925f997",
    "type": "text/plain",
    "size": 18
  }
}
```

Let's turn this into a test. Looking at the example above, we need to do the following:

- make a `POST` request
- include a `Content-Type` **header** using `text/plain`
- include an `Authorization` **header** with the correct **username** and **password** details
- include a **body** with our fragment data: `This is a fragment`

We also expect certain things to happen as a result. We expect a response that has:

- an HTTP `201` status code
- a `Location` **header** with an absolute URL to the new fragment
- a `Content-Type` **header** indicating we're getting JSON data
- a `Content-Length` **header** indicating how big the JSON response is
- a **body** with a single JSON Object, containing our fragment's metadata

We'll write a `.hurl` file to test this.

1. Create a new file, `tests/integration/post-fragments.hurl`.

2. There are two ways to provide the HTTP Basic Auth credentials: 1) manually including the `Authorization` header with a [base64](https://linux.die.net/man/1/base64) encoded username and password (e.g., `user1@email.com` and password `password1`); or 2) using the [optional `[BasicAuth]` section](https://hurl.dev/docs/request.html#basic-authentication) in your request. Here is what each way looks like:

   ```sh
   # Option 1 - create a base64 encoded username and password to use in the Authorization header
   $ echo -n 'user1@email.com:password1' | base64
   dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
   ```

   Using this username and password in the hurl request would mean that our `Authorization` header would look like this:

   ```sh
   POST http://localhost:8080/v1/fragments
   Content-Type: application/json
   Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
   ```

   Here is the second option, using the optional `[BasicAuth]` section in the hurl request:

   ```sh
   # Option 2 - using the [BasicAuth] section, which must go AFTER the headers
   POST http://localhost:8080/v1/fragments
   Content-Type: application/json
   [BasicAuth]
   user1@email.com:password1
   ```

   In this case, the username and password are embedded as plain text in the [hurl request](https://hurl.dev/docs/request.html). Make sure you get the [order right](https://hurl.dev/docs/request.html#structure), since the `[BasicAuth]` section _must_ follow any headers.

   This second method is preferred, since it makes it clear which username and password are being used in the tests; but both ways are equivalent.

3. Next, write the `POST` test in `tests/integration/post-fragments.hurl`, using our base64 encoded `Authorization` header, and creating a basic plain text fragment:

   ````sh
   # tests/integration/post-fragments.hurl
   # Authenticated POST to /v1/fragments
   POST http://localhost:8080/v1/fragments
   # We're sending a plain text fragment
   Content-Type: text/plain
   # Include HTTP Basic Auth credentials
   [BasicAuth]
   user1@email.com:password1
   # Body of the request goes in ```...``` when it's a string
   `This is a fragment!`

   # We expect to get back an HTTP 201
   HTTP/1.1 201
   # We have various assertions about the response that we want to check
   [Asserts]
   # The Location header should look like what we expect (including the fragment id)
   header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
   jsonpath "$.status" == "ok"
   # Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
   jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
   # Our ownerId hash is a hex encoded string
   jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
   # Basic check for the presence of created and updated date strings.
   # You could also write a regex for this and use matches
   jsonpath "$.fragment.created" isString
   jsonpath "$.fragment.updated" isString
   jsonpath "$.fragment.type" == "text/plain"
   # 19 is the length of our fragment data: 'This is a fragment!'
   jsonpath "$.fragment.size" == 19
   ````

4. Run both of the tests you've written:

   ```sh
   $ npm run test:integration
   expr=tests/integration/health-check.hurl
   tests/integration/post-fragments.hurl: RUNNING [1/2]
   tests/integration/post-fragments.hurl: SUCCESS
   tests/integration/health-check.hurl: RUNNING [2/2]
   tests/integration/health-check.hurl: SUCCESS
   --------------------------------------------------------------------------------
   Executed:  2
   Succeeded: 2 (100.0%)
   Failed:    0 (0.0%)
   Duration:  46ms
   ```

5. Next, let's extend our `POST` test case to do one more thing. Since this is an integration- vs. unit-test, we're interested to see that the entire program is functioning corrected from end-to-end (integration tests are also known as "end-to-end" tests, or "e2e" for short), we should not only try to `POST` a new fragment, but also attempt to `GET` it back. Doing so will involve **capturing** the `Location` header's URL, which should point to the newly created fragment. We can [capture values from an HTTP response into a variable](https://hurl.dev/docs/capturing-response.html) and use it in a second request:

   ````sh
   # tests/integration/post-fragments.hurl
   # Authenticated POST to /v1/fragments
   POST http://localhost:8080/v1/fragments
   # We're sending a plain text fragment
   Content-Type: text/plain
   # Include HTTP Basic Auth credentials
   [BasicAuth]
   user1@email.com:password1
   # Body of the request goes in ```...``` when it's a string
   `This is a fragment!`

   # 1. We expect to get back an HTTP 201
   HTTP/1.1 201
   # We have various assertions about the response that we want to check
   [Asserts]
   # The Location header should look like what we expect (including the fragment id)
   header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
   jsonpath "$.status" == "ok"
   # Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
   jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
   # Our ownerId hash is a hex encoded string
   jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
   # Basic check for the presence of created and updated date strings.
   # You could also write a regex for this and use matches
   jsonpath "$.fragment.created" isString
   jsonpath "$.fragment.updated" isString
   jsonpath "$.fragment.type" == "text/plain"
   # 19 is the length of our fragment data: 'This is a fragment!'
   jsonpath "$.fragment.size" == 19
   # Capture the Location URL into a variable named `url`
   [Captures]
   url: header "Location"

   # 2. Try to GET the fragment we just posted by its URL
   GET {{url}}
   [BasicAuth]
   user1@email.com:password1

   HTTP/1.1 200
   Content-Type: text/plain; charset=utf-8
   Content-Length: 19
   [Asserts]
   body == "This is a fragment!"
   ````

6. Using what you just learned, and the [hurl docs](https://hurl.dev/docs/man-page.html), write the following integration tests yourself:

| Name                                   | Details                                                                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `post-fragments-unsupported-type.hurl` | Confirm that posting an unsupported `Content-Type` produces a `415` error                                                                                                   |
| `post-fragments-charset.hurl`          | Confirm that posting a fragment `Content-Type` that includes a charset (e.g., `text/plain; charset=utf-8`) works, and is returned as the fragment's type when doing a `GET` |
| `post-fragments-unauthenticated.hurl`  | Confirm that posting a fragment when not authenticated produces a `401` error                                                                                               |
| `post-fragments-json.hurl`             | Confirm that posting a JSON fragment works, and doing a `GET` for the same fragment returns the expected result                                                             |

## 2. `docker compose` and AWS Mocking

As we prepare to start using more AWS services (specifically [S3](https://aws.amazon.com/s3/) and [DynamoDB](https://aws.amazon.com/dynamodb/)) with our `fragments` server, now is a good time to create a fully functional offline and testing environment. We won't always want to run real cloud infrastructure when we develop and test our code, mainly due to cost; but also because we often need to "mock" (i.e., fake) databases, and not store data for real.

Thankfully, a number of offline solutions exist for working with common AWS services. In this lab we'll set up two of them using Docker and [Docker Compose](https://docs.docker.com/compose/):

1. [MiniStack](https://ministack.org/)
2. [DynamoDB local](https://hub.docker.com/r/amazon/dynamodb-local)

> [!NOTE]
> It is possible to use [MiniStack](https://ministack.org/) to run all of the services we need; however, using Amazon's own [DynamoDB local](https://hub.docker.com/r/amazon/dynamodb-local) gets us as close as possible to the real thing. We'll work with both to give you the experience of working with multiple services at once.

### 2.1 `docker compose` and fragments

Let's begin by creating a [docker-compose.yml file](https://docs.docker.com/compose/compose-file/compose-file-v3/) that can run our `fragments` server. Where a `Dockerfile` is for **building** a Docker Image, a [docker-compose.yml file](https://docs.docker.com/compose/compose-file/compose-file-v3/) is for running Docker Containers.

1. In the root of your `fragments` project, create a new file called `docker-compose.yml`.

2. The `docker-compose.yml` should begin with a `services` key, and below it, each of the Docker-based services we want to run. To start, we'll have only one service:

   ```yml
   # docker-compose.yml

   services:
     # Fragments microservice API server
     fragments:
       # Use a proper init process (tini)
       init: true
       # Build the Docker Image using the Dockerfile
       # and current directory as the build context
       build: .
   ```

3. To **build** and **run** our service(s), we use `docker compose up`. This will fail in the same way that our service always fails, when we're **missing environment variables**. Let's add those to our compose file.

4. Extend your `fragments` service definition with the **environment variables** and **ports** it needs in order to run:

   ```yml
   # docker-compose.yml

   services:
     # Fragments microservice API server
     fragments:
       # Use a proper init process (tini)
       init: true
       # Build the Docker Image using the Dockerfile
       # and current directory as the build context
       build: .
       # Environment variables to use
       environment:
         # Our API will be running on http://localhost:8080
         - API_URL=http://localhost:8080
         # Use Basic Auth (for running tests, CI)
         - HTPASSWD_FILE=tests/.htpasswd
         # Use the FRAGMENTS_LOG_LEVEL set in the host environment, or default to info
         - FRAGMENTS_LOG_LEVEL=${FRAGMENTS_LOG_LEVEL:-info}
       # Ports to publish
       ports:
         - '8080:8080'
   ```

5. Try running your server again, `docker compose up`, which should now work (if it doesn't, debug before continuing).

6. You can stop the server with `CTRL+C`. You can also run your service(s) in the background using `-d`, and use `down` to stop them:

   ```sh
   docker compose up -d
   docker compose down
   ```

> [!TIP]
> If you make changes to your `fragments` source code, and want to rebuild your Docker image, you can use the `--build` flag to force a rebuild: `docker compose up --build`

### 2.2 `docker compose` and DynamoDB local

The [amazon/dynamodb-local](https://hub.docker.com/r/amazon/dynamodb-local) Docker Image allows you to run a Docker Container locally that mimics how [DynamoDB](https://aws.amazon.com/dynamodb/) works on AWS. Let's add it to our compose file:

1. Modify your `docker-compose.yml` file to include a second service, below your `fragments` service. We'll use the [Docker Hub Image](https://hub.docker.com/r/amazon/dynamodb-local) vs. a `build` context. We'll also override the default [command](https://docs.docker.com/compose/compose-file/compose-file-v3/#command), in order to run the database in memory (e.g., store no files to disk). Finally, we'll publish port `8000`, the default port used by the server:

   ```yml
   services:
     fragments: ...

     # DynamoDB Local, see: https://hub.docker.com/r/amazon/dynamodb-local
     dynamodb-local:
       image: amazon/dynamodb-local
       ports:
         # Default port is 8000
         - '8000:8000'
       # Run the database in memory, see:
       # https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.UsageNotes.html
       command: ['-jar', 'DynamoDBLocal.jar', '-inMemory']
   ```

2. Try running your services, which will **pull** the layers needed for the [amazon/dynamodb-local image](https://hub.docker.com/r/amazon/dynamodb-local):

   ```sh
   docker compose up
   ```

   You should see log messages from both services: `fragments` and `dynamodb-local`.

3. Make sure you can access both services:

   ```sh
   $ curl localhost:8080
   {"status":"ok","author":"David Humphrey <david.humphrey@senecapolytechnic.ca>","githubUrl":"https://github.com/humphd/fragments","version":"0.8.0"}
   $ curl localhost:8000
   {"__type":"com.amazonaws.dynamodb.v20120810#MissingAuthenticationToken","Message":"Request must contain either a valid (registered) AWS access key ID or X.509 certificate."}
   ```

### 2.3 docker-compose and MiniStack

Similar to [amazon/dynamodb-local](https://hub.docker.com/r/amazon/dynamodb-local), the [ministackorg/ministack](https://hub.docker.com/r/ministackorg/ministack) image on Docker Hub can be used to mock multiple AWS services, including [S3](https://aws.amazon.com/s3/).

1. Modify your `docker-compose.yml` file to include a third service, below your `dynamodb-local` service. We'll use the [ministackorg/ministack](https://hub.docker.com/r/ministackorg/ministack) image. We'll set a number of AWS related **environment variables**, and also list `s3` as the only AWS Service we want to mock. Finally, we'll publish port `4566`, the default port used by the server:

   ```yml
   services:
     fragments: ...

     dynamodb-local: ...

     # MiniStack for S3, see https://ministack.org/docs/
     ministack:
       # https://hub.docker.com/r/ministackorg/ministack
       image: ministackorg/ministack
       ports:
         - '4566:4566'
       environment:
         # See https://ministack.org/docs/configuration for config details.
         # We only want to run S3
         - SERVICES=s3
         # We will use us-east-1
         - MINISTACK_REGION=us-east-1
   ```

2. Try running your services, which will **pull** the layers needed for the [ministackorg/ministack](https://hub.docker.com/r/ministackorg/ministack) image:

   ```sh
   docker compose up
   ```

   You should see log messages from all three services: `fragments`, `dynamodb-local`, and `ministack`.

3. Make sure you can access all three services:

   ```sh
   $ curl localhost:8080
   {"status":"ok","author":"David Humphrey <david.humphrey@senecapolytechnic.ca>","githubUrl":"https://github.com/humphd/fragments","version":"0.8.0"}

   $ curl localhost:8000
   {"__type":"com.amazonaws.dynamodb.v20120810#MissingAuthenticationToken","Message":"Request must contain either a valid (registered) AWS access key ID or X.509 certificate."}

   $ curl localhost:4566/_ministack/health
   {"services": {"acm": "available", "apigateway": "available", "cloudformation": "available", "cloudwatch": "available", "config": "available", "dynamodb": "available", "dynamodbstreams": "available", "ec2": "available", "es": "available", "events": "available", "firehose": "available", "iam": "available", "kinesis": "available", "kms": "available", "lambda": "available", "logs": "available", "opensearch": "available", "redshift": "available", "resource-groups": "available", "resourcegroupstaggingapi": "available", "route53": "available", "route53resolver": "available", "s3": "available", "s3control": "available", "secretsmanager": "available", "ses": "available", "sns": "available", "sqs": "available", "ssm": "available", "stepfunctions": "available", "sts": "available", "support": "available", "swf": "available", "transcribe": "available"}, "version": "2.0.0.dev"}
   ```

   > [!TIP]
   > Use `localhost:4566/_ministack/health` route for accessing MiniStack healthcheck endpoint.

4. Install the [AWS cli](https://aws.amazon.com/cli/), which we'll use in the next step to run commands against the local AWS services.

5. Write a script in `scripts/local-aws-setup.sh` to create an S3 Bucket and DynamoDB Table in the mock AWS services we are running. We'll pass [`--endpoint-url` flags](https://docs.aws.amazon.com/cli/latest/reference/#options) to use the local versions of the services vs. the normal ones on AWS. NOTE: one thing the scripts below do is wait for resources to become **ready**. This is something we often need to do with distributed systems:

   ```sh
   #!/bin/sh

   # Setup steps for working with MiniStack and DynamoDB local instead of AWS.
   # Assumes aws cli is installed and MiniStack and DynamoDB local are running.

   # Setup AWS environment variables
   echo "Setting AWS environment variables for MiniStack"

   echo "AWS_ACCESS_KEY_ID=test"
   export AWS_ACCESS_KEY_ID=test

   echo "AWS_SECRET_ACCESS_KEY=test"
   export AWS_SECRET_ACCESS_KEY=test

   export AWS_DEFAULT_REGION=us-east-1
   echo "AWS_DEFAULT_REGION=us-east-1"

   # Wait for MiniStack to be ready, by inspecting the response from healthcheck
   echo 'Waiting for MiniStack S3...'
   until (curl --silent http://localhost:4566/_ministack/health | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
       sleep 5
   done
   echo 'MiniStack S3 Ready'

   # Create our S3 bucket with MiniStack
   echo "Creating MiniStack S3 bucket: fragments"
   aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments

   # Setup DynamoDB Table with dynamodb-local, see:
   # https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html
   echo "Creating DynamoDB-Local DynamoDB table: fragments"
   aws --endpoint-url=http://localhost:8000 \
   dynamodb create-table \
       --table-name fragments \
       --attribute-definitions \
           AttributeName=ownerId,AttributeType=S \
           AttributeName=id,AttributeType=S \
       --key-schema \
           AttributeName=ownerId,KeyType=HASH \
           AttributeName=id,KeyType=RANGE \
       --provisioned-throughput \
           ReadCapacityUnits=10,WriteCapacityUnits=5

   # Wait until the Fragments table exists in dynamodb-local, so we can use it, see:
   # https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/wait/table-exists.html
   aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
   ```

6. Make the `local-aws-setup.sh` script executable and try running it. It should be able to create the S3 Bucket and DynamoDB Table:

   ```sh
   $ chmod +x ./scripts/local-aws-setup.sh
   $ docker compose up -d
   $ ./scripts/local-aws-setup.sh
   Setting AWS environment variables for MiniStack
   AWS_ACCESS_KEY_ID=test
   AWS_SECRET_ACCESS_KEY=test
   AWS_DEFAULT_REGION=us-east-1
   Waiting for MiniStack S3...
   MiniStack S3 Ready
   Creating MiniStack S3 bucket: fragments
   {
       "Location": "/fragments"
   }
   Creating DynamoDB-Local DynamoDB table: fragments
   {
       "TableDescription": {
           "AttributeDefinitions": [
               {
                   "AttributeName": "ownerId",
                   "AttributeType": "S"
               },
               {
                   "AttributeName": "id",
                   "AttributeType": "S"
               }
           ],
           "TableName": "fragments",
           "KeySchema": [
               {
                   "AttributeName": "ownerId",
                   "KeyType": "HASH"
               },
               {
                   "AttributeName": "id",
                   "KeyType": "RANGE"
               }
           ],
           "TableStatus": "ACTIVE",
           "CreationDateTime": "2022-03-22T11:13:15.952000-04:00",
           "ProvisionedThroughput": {
               "LastIncreaseDateTime": "1969-12-31T19:00:00-05:00",
               "LastDecreaseDateTime": "1969-12-31T19:00:00-05:00",
               "NumberOfDecreasesToday": 0,
               "ReadCapacityUnits": 10,
               "WriteCapacityUnits": 5
           },
           "TableSizeBytes": 0,
           "ItemCount": 0,
           "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/fragments"
       }
   }
   $ docker compose down
   ```

7. Update the **environment variables** of the `fragments` service to include AWS specific variables for future use. In particular, we want to set the AWS credentials, as well as the local S3 and DynamoDB endpoint URLs and resource names. In later weeks, we'll use these in our code:

   ```yml
   # docker-compose.yml

   services:
       fragments:
           ...
           environment:
               # Our API will be running on http://localhost:8080
               - API_URL=http://localhost:8080
               # Use Basic Auth (for running tests, CI)
               - HTPASSWD_FILE=tests/.htpasswd
               # Use the FRAGMENTS_LOG_LEVEL set in the host environment, or default to info
               - FRAGMENTS_LOG_LEVEL=${FRAGMENTS_LOG_LEVEL:-info}
               - AWS_REGION=us-east-1
               # Use the MiniStack endpoint vs. AWS for S3 AWS SDK clients.
               # NOTE: we use Docker's internal network to the ministack container
               - AWS_S3_ENDPOINT_URL=http://ministack:4566
               # Use the DynamoDB local endpoint vs. AWS for DynamoDB AWS SDK clients.
               - AWS_DYNAMODB_ENDPOINT_URL=http://dynamodb-local:8000
               # This S3 bucket and DynamoDB table need to get created first, see
               # local-aws-setup.sh. We'll default to 'fragments' as the name, unless
               # something else is defined in the env.
               - AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME:-fragments}
               - AWS_DYNAMODB_TABLE_NAME=${AWS_DYNAMODB_TABLE_NAME:-fragments}
           # Ports to publish
           ports:
              - "8080:8080"
   ```

   In the `AWS_S3_ENDPOINT_URL` and `AWS_DYNAMODB_ENDPOINT_URL` variables above, notice the addresses, which take the following form: `http://<docker-compose service name>:<port>`. Docker creates a special network, whereby each service can talk to another **internally** without us exposing anything to the outside world. This technique is often used to connect databases or other service containers to user-facing application containers.

8. Re-run your integration tests against your server running via `docker compose`, and make sure everything passes:

   ```sh
   docker compose up -d fragments
   npm run test:integration
   docker compose down
   ```

### 2.4 docker-compose and Running Specific Services

So far we've been starting all of our services at once. However, you can also provide a list of one or more service names to start, ignoring the others. For example, to run only the mock AWS services, you would use:

```sh
docker compose up dynamodb-local ministack
```

This is useful if you want to run a specific service without wasting resources on the others.

## Submission

1. Add all of the changes you've made to your code to git and `push` to GitHub. Link to the `tests/integration` folder on GitHub for your `fragments` repo, showing all of the `.hurl` files you wrote for the test cases above.
2. Screenshot of all three containers successfully being started using `docker compose`.
3. Screenshot of the `local-aws-setup.sh` running successfully against the running containers
4. Screenshot of hurl successfully running all of the integration tests described above.
5. Screenshot of your current account costs in the AWS Console
