# Week 10: Integration Testing with Docker Compose

## Lecture

<https://www.youtube.com/watch?v=Wx_mzCLl_S4>

## Integration Testing Overview

### Unit Testing vs Integration Testing

We've put a lot of emphasis on unit testing so far. Unit testing allows us to take code and break it down into the smallest possible unit. That could be a function, a module, a class, whatever it is, but you've got some small unit of code that you want to test. A key idea with unit testing is that you're testing things in isolation.

With unit tests, we're going to have lots and lots of small tests because if we're testing a function and the function has an if statement with an else clause, we've got this tree that we could go down different paths. We need to have multiple tests in order to cover all those cases. You think about every error case, every success case, input that looks like this, input that looks like that - you have to write all these different versions of your unit tests. So you end up with lots of little tests and they all focus on testing one tiny piece of the code.

### What is Integration Testing?

Now we're going to move up and add another kind of test. Notice I said "add" - it's not that we either do unit tests or we do integration tests. We're going to do both because they test different things.

Integration tests are about just what the name implies: integration. We're going to take all these little units of code and we're going to put them together and we're going to build a system or part of the system and we're going to be able to test it.

Instead of thinking about "does this function do what it's supposed to do," we're starting to think about "does this flow of functions do what it's supposed to do?" If I do this feature and the feature touches all kinds of code and it talks to the database and it talks to the file system and it goes over the network and does all these things, does that work?

### Testing Triangle

Integration tests are sort of the middle tier of this testing triangle. If you can imagine at the very bottom we have all of our unit tests. I'm showing the unit tests at the bottom because we're going to have more unit tests than anything else. They're small, there's many of them, they're testing all the individual units of code that we have.

As we move up and get into working on integration tests, we're going to write fewer integration tests. We're going to need fewer integration tests because the integration tests are going to touch more of the code at once. Where the unit tests are trying to figure out "does this function throw an exception when it's supposed to," the integration tests are going to be looking to see if this piece of code plus this piece of code plus this piece of code do what they're supposed to do.

As a result, the integration tests can be harder to write, they can take longer to write and be harder to debug, but we tend to need fewer of them when we're done.

### End-to-End Testing

Another important point here is that we can integrate some or all of the subsystems. We don't necessarily have to run our entire system in a test - that can be very difficult and that's what's at the very top of the pyramid.

An end-to-end test (E2E test) is an integration test that basically has the whole system coming together. Imagine in the case of what we're building: there's a web front-end, there's a web backend, there's a bunch of AWS cloud resources, and you're testing that entire system.

You can use tools like Playwright for this. If you look at playwright.dev, this is one of my favorite test automation tools. It basically lets you automate everything that happens in a browser as if you're a user, so you could build login flows and test everything. It is actually possible to do this kind of thing, but it's tricky.

For the purposes of what we're doing, we're going to focus on integration testing with our back-end server.

## Unit Test vs Integration Test Examples

### Unit Test Example

If you think of the example of the function `createSuccessResponse`, we know that in the simplest case this function should return a JSON object which should look like this:

```json
{
  "status": "ok"
}
```

This is a really easy thing to write a test for. You call this function, you get the result, you expect that the result is going to equal this object that we give it, and if it doesn't then there's something that's broken.

### Integration Test Example

When we write an integration test, it's going to be different. An integration test is almost always going to have multiple steps. For example:

1. A user authenticates via HTTP basic auth (notice we are using something called a mock - we are pretending with part of the system)
2. They create a markdown fragment
3. Then they request that fragment again as HTML
4. We should get back the expected HTML

There's a lot of code involved there that's touching our database, looking at doing fragment conversion, working on our HTTP routes, etc. But if that works, we know that a lot of our system is working.

When you combine that together with the unit tests, you have good coverage of "these are the individual functions and they do what they're supposed to do" and then "these integration tests help me understand that when I call these things, these pieces work together."

### End-to-End Test Example

If we did an end-to-end test, we would get rid of the mocking on the authentication. We would use a browser and authenticate via Cognito in the browser. We would do a real login and get back the identity token, pass the identity token along with the request, and do all the steps. We would write our tests in the browser using browser-based JavaScript rather than some of the other techniques that we're going to use in the labs this week.

## Testing Cloud Services

When you're going to test things that involve the cloud, you've got basically two main ways that people do this:

### Option 1: Simulate Everything Locally

The first approach is that you simulate everything locally. When you're working on your development on your laptop or working in a CI/CD pipeline like GitHub Actions, you're going to provide mock services. You're not going to have real AWS services - you're going to put up these pretend ones and use those instead.

**Advantages:**

- You can simulate these AWS services with something that is "good enough"
- It's cheaper to do this - we don't have to involve AWS, we don't have to spend any money
- It's fast to run because I can run everything on my local machine or in my CI/CD pipeline

This is the approach that I'm going to be focusing on teaching you how to do.

### Option 2: Use Real Cloud Services Temporarily

The second thing that people will do is they'll use real cloud services but when they're done doing their testing they'll throw them away. Imagine if you put another step in your GitHub Actions workflow where you would automate creating whatever cloud resources you're going to use as part of the test. These cloud resources would have a very short lifespan for the duration of your CI/CD test run and then they would be destroyed.

**Advantages:**

- You're using the real thing so you're not mocking anything
- There's going to be no difference between your testing environment and your production environment

**Disadvantages:**

- It's going to cost you money
- It involves using a technique called Infrastructure as Code

We'll look at Infrastructure as Code in the final week of the course. The idea is that you write code which generates cloud resources. Technologies include AWS CloudFormation, CDK, Terraform, etc.

We're going to focus on option number one because it's not going to cost us anything and for students who are learning to do this, it's nice because you can do it all locally.

## Integration Tests and Mocking

### What are Mocks?

I want to differentiate between mock cloud services and mocks when you're doing things inside of your test, especially in integration tests where you have to fake certain things.

We have a portion of our system that we don't want to use, so sometimes this is called test mocks or it'll be called doubles or they'll talk about faking certain parts of your system. What you have is some part of your system and you want to make a stand-in version: your database, your network, your file system, an API.

We've actually been doing this. If you think about how our current database works in the fragments microservice, we don't actually write anything to a database. Our database is totally fake - it's an in-memory object where we just sort of pretend that we have a database. So we've been using mocks for quite a while.

### Benefits of Mocking

This is nice because you can get around things like:

- Really stringent security restrictions
- Performance issues
- Scaling things that are hard to scale

You can write pretend versions of it and that's what we're going to be doing. The rest of what you're working on doesn't know the difference. Your code talks to whatever system through an API. We're going to provide the same API but we're going to have a fake or a mock implementation behind it.

### Testing Edge Cases with Mocks

Another nice thing about mocks: I've had a number of students ask me how do I increase my test coverage to a hundred percent. First of all, you almost never get to a hundred percent because it's a game you start playing where it's not worth playing.

For example, you're going to have try-catch blocks. In your catch blocks, certain errors only occur if the database fails or if you run out of memory or if you can't find a file - all these weird conditions that are hard to reproduce.

What people do is in order to simulate those conditions, they'll have mock implementations of the file system. If you wanted to pretend that a file doesn't exist, you could mock the Node FS object and now whenever you try to read a file, you can just throw an error and see what your code would do if suddenly the file system didn't work.

Mocks are really helpful for being able to simulate difficult conditions and see how your code performs in a test.

## Docker Compose Introduction

One of the technologies that we're going to use to do a lot of this mocking is Docker Compose. It's a tool that you've already got installed on your machine when you install Docker. When you install Docker Desktop and you get the Docker CLI, you're also going to get another tool called Docker Compose.

### The Problem Docker Compose Solves

You've written commands like this many times now:

```bash
docker run --rm --init --env-file .env -e FRAGMENTS_LOG_LEVEL=debug -p 8080:8080 fragments:latest
```

I have forced you to type out long Docker run commands on EC2 instances and on your laptops in order to get things working. Here's an example where I want to run a container called fragments with all these different arguments that I need to pass to Docker every single time, and it's annoying to have to type all that.

What if you could put all of that into a file? What if you thought about all of those settings as configuration and you said "I want to be able to pass a configuration for the way that I want to run a container and I want you to just figure it out"?

### Docker Compose Solution

We're going to use Docker Compose to do exactly that. We're going to write YAML files (the cloud loves YAML) and you're going to use a couple of commands:

- `docker compose up` - starts up all of your containers
- `docker compose down` - stops all of those containers and removes them

Really it's a way for us to put all of the information about what we want to run and how we want to run it into a file and then be able to use a single command to run one or more containers in the way that we've configured.

We can also use it to both build images from Dockerfiles (great for development) or pull images from registries (great when you have things that somebody else has written).

Docker Compose makes it really easy for us to create complex development, staging, or production environments based on containers.

## Docker Run to Docker Compose Translation

Let me try and transition you from Docker run to Docker Compose. I almost never use Docker run - the only time I use Docker run really is when I'm teaching this course. Most of the time I would probably reach for Docker Compose.

### Example Translation

**Docker run command:**

```bash
docker run \
  --rm \
  --init \
  --env-file .env \
  -e FRAGMENTS_LOG_LEVEL=debug \
  -p 8080:8080 \
  fragments
```

**Docker Compose equivalent:**

```yaml
services:
  fragments:
    image: fragments
    init: true
    env_file: .env
    environment:
      - FRAGMENTS_LOG_LEVEL=debug
    ports:
      - '8080:8080'
```

Once I write this Docker Compose file, I can save it and put it in git. Every time I want to run my fragment server, I would say `docker compose up` and it would start up the fragment server using this configuration.

### File Naming

When you type `docker compose up` or `docker compose down`, it's going to look in the current directory for a file called `docker-compose.yaml`. You can also write other file names:

- `docker-compose.dev.yaml`
- `docker-compose.prod.yaml`
- `docker-compose.ci.yaml`

You would use the `-f` flag to specify a different file:

```bash
docker compose -f docker-compose.dev.yaml up
```

## Multi-Service Docker Compose

The Docker Compose file is named "docker-compose" because it literally composes - it takes a bunch of things and puts them together. It makes one whole system out of a bunch of separate pieces.

### Two-Tier App Example

Here's a two-tier app that is pretty common. Imagine you're doing your systems project and your systems project needs to use MongoDB, and in the front end you have a web server/web app:

```yaml
services:
  db:
    image: mongo:6.0.2
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  web:
    build:
      context: ./web
    ports:
      - '80:8080'
```

Notice that the names I'm choosing (db and web) are just strings. You can call these anything you want.

We give each of our services a name and then we define how Docker Compose should get the image that it needs. I'm showing you both ways of doing it:

1. **Using an image:** `mongo:6.0.2` - go and get the Mongo image and use the 6.0.2 tag
2. **Building:** `build: context: ./web` - go into the web directory, find a Dockerfile, and use that to build the web image

If you were to call `docker compose up` on this YAML file, it would pull the Mongo image and build the web image, then run containers based on both of those images.

## Advanced Docker Compose Features

### Build Arguments

You can expand the build key and define build arguments:

```yaml
services:
  web:
    build:
      context: ./web
      args:
        - API_URL=http://api:4000
```

### Dependencies

You can define dependencies between your services:

```yaml
services:
  api:
    build: ./api
    depends_on:
      - db

  web:
    build: ./web
    depends_on:
      - api

  db:
    image: postgres:13
```

These dependencies say "before you can run this service, you also need to start these other services." If I said `docker compose up web`, even though I only listed web app, it would start the database and API as well because of the dependency chain.

**Important Note:** The startup order of these things is not guaranteed. The web app container might start before the database container is ready. You need to write your programs so they don't fail if something's not there - they need to retry.

### Init Process

You can specify that you want to use tini as your init process:

```yaml
services:
  api:
    image: my-api
    init: true
```

I would suggest that you do this on all the containers/services that you are building.

### Port Publishing

There are three ways to handle ports:

```yaml
services:
  # Explicit host and container port
  api:
    image: my-api
    ports:
      - '4000:4000'

  # Let Docker choose the host port
  web:
    image: my-web
    ports:
      - '3000'

  # No external access (internal only)
  db:
    image: postgres
    # No ports defined
```

### Restart Policies

You can specify what happens if a container crashes:

```yaml
services:
  api:
    image: my-api
    restart: always # Always restart if it crashes

  web:
    image: my-web
    restart: unless-stopped # Restart unless explicitly stopped
```

In development you may or may not want this turned on because if your code crashes on startup, it'll just get into a loop where it crashes and restarts repeatedly.

## Environment Variables in Docker Compose

One of the main reasons that people love using Docker Compose is that it lets us put all of our environment setup into a file.

### Global Environment File

You can pass an environment file to Docker Compose:

```bash
docker compose --env-file .env up
```

The environment file gets used for all of the services.

### Service-Specific Environment Files

```yaml
services:
  api:
    build: ./api
    env_file: api.env
```

### Individual Environment Variables

```yaml
services:
  api:
    build: ./api
    environment:
      - NODE_ENV # Forward from host
      - AWS_REGION=us-east-2 # Static value
      - LOG_LEVEL=${LOG_LEVEL:-info} # Host value or default
      - MONGO_URL=http://db:28017 # Reference other service
```

**Explanation of syntax:**

- `NODE_ENV` - Forward the value from the host environment
- `AWS_REGION=us-east-2` - Always use this static string
- `LOG_LEVEL=${LOG_LEVEL:-info}` - Use host value if defined, otherwise use "info"
- `MONGO_URL=http://db:28017` - Use the service name as hostname

## Docker Networking and the Localhost Problem

This is a big gotcha that you're going to trip over many times. The problem is understanding what "localhost" means in different contexts.

### The Problem

- **On the host machine:** `http://localhost:3000` means "go find whatever is on port 3000 on my host machine"
- **Inside a container:** `localhost` means the machine that the container is running in, not the host machine

If you have a Mongo instance running in one container and an API server running in another container, you have two containers and a host - sort of like three computers that are all running. If the API server tries to contact `localhost:27017`, it's not going to work because localhost:27017 isn't running inside the API container - it's only running in the Mongo container.

### The Solution: Docker DNS

Docker creates a DNS entry so that each service can resolve to the other. If I ask for `http://web:3000` or `http://api:4000` or `http://db:5000`, they can all talk to each other without using localhost.

Instead of saying `localhost:3000` inside the database, you would say `web:3000` and it would work. You use the name of the container itself for intra-container communication.

## Example: Full Stack Application

Here's an example of running both your fragments backend and frontend:

```yaml
services:
  api:
    image: ${DOCKER_HUB_USERNAME}/fragments
    ports:
      - '8080:8080'

  ui:
    image: ${DOCKER_HUB_USERNAME}/fragments-ui
    ports:
      - '80:1234'
    environment:
      - API_URL=http://api:8080
```

Notice that I'm specifying the name of my API container (`api:8080`) rather than saying `localhost:8080`.

## Mocking AWS Services

### What is an AWS Service?

Every AWS service that is out there is just an HTTP API. It's a series of endpoints (URLs) that you can send HTTP requests to and it will respond and do certain things.

In terms of mocking these things, what I need is to be able to give a different or alternate endpoint - a different URL that I'm going to use in development or testing. However, that URL has to provide the exact same REST API as whatever I would get from the real AWS.

### AWS Tools Support for Custom Endpoints

All of the AWS tools (whether you're using the command line tools or the SDKs) allow you to pass in an endpoint URL - something other than the main AWS URL.

**CLI Example:**

```bash
# Real AWS
aws dynamodb list-tables

# Local mock
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

**SDK Example:**

```javascript
// Real AWS
const client = new DynamoDBClient({ region: 'us-east-2' });

// Local mock
const client = new DynamoDBClient({
  region: 'us-east-2',
  endpoint: 'http://localhost:8000',
});
```

## MiniStack

MiniStack is both a company and an open source technology. You can use MiniStack for free and get a bunch of these services, or you can pay them and get access to all of their services.

### Using MiniStack

```yaml
services:
  ministack:
    image: ministackorg/ministack
    ports:
      - '4566:4566'
    environment:
      - SERVICES=s3,ecr,ec2
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
```

All of these Amazon services would be running at `localhost:4566` inside that container. You configure the services that you want to start with a comma-separated list.

## DynamoDB Local

There is a container/image available from Amazon called DynamoDB Local. They have a version of DynamoDB written in Java that you can run locally on your machine as a container. Because Amazon maintains it, it's like a one-to-one feature complete version of DynamoDB except that it doesn't scale the way that Amazon's database is going to scale.

```yaml
services:
  dynamodb:
    image: amazon/dynamodb-local
    ports:
      - '8000:8000'
    command: ['-jar', 'DynamoDBLocal.jar', '-inMemory']
```

The custom command makes it run in memory - it doesn't actually store anything to disk. When it's done, it deletes all of the data that's there. You could also put in a volume and have all the data stored to disk so you can work with it later.

## Conclusion

This covers the fundamentals of integration testing with Docker Compose. We've learned how to:

- Understand the difference between unit tests, integration tests, and end-to-end tests
- Use Docker Compose to orchestrate multiple containers
- Handle networking between containers
- Mock AWS services for local development and testing
- Set up complex development environments with configuration files
