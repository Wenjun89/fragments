# Week 10

## Lectures

1. [Integration testing and `docker compose`](./integration-testing.md)
2. [Authoring `docker-compose.yml` files and using the `docker compose` command](./docker-compose-examples.md)
3. [Writing integration tests with hurl](./hurl-integration-tests.md) ([Hurl](https://hurl.dev))

## Readings and References

- [Docker Compose](https://docs.docker.com/compose/)
  - [docker-compose (v1) vs. docker compose (v2)](https://docs.docker.com/compose/compose-v2/)
  - [docker-compose.yml Syntax](https://docs.docker.com/reference/compose-file/)
  - [nginx](https://www.nginx.com/)
    - [Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)
    - nginx Reverse Proxy Example
      - [docker-compose.yml](nginx-proxy-example/docker-compose.yml)
      - [nginx-proxy.conf](nginx-proxy-example/nginx-proxy.conf)
- Simulating AWS Services Offline with `docker compose`
  - [MiniStack](https://ministack.org/) ([Docker Hub Image](https://hub.docker.com/r/ministackorg/ministack)) (NOTE: we previously used [LocalStack](https://www.localstack.cloud/), but it now requires an account and auth to run locally, so we have switched to MiniStack)
  - [DynamoDB local](https://hub.docker.com/r/amazon/dynamodb-local) ([Docker Hub Image](https://hub.docker.com/r/amazon/dynamodb-local))
- [Hurl](https://hurl.dev/) for Integration Testing
  - [Installation](https://hurl.dev/docs/installation.html)
  - [Tutorial](https://hurl.dev/docs/tutorial/your-first-hurl-file.html) and using [Assertions](https://hurl.dev/docs/tutorial/adding-asserts.html)
  - [Running Tests](https://hurl.dev/docs/running-tests.html)
  - [Samples](https://hurl.dev/docs/samples.html)
- [JSONPath](https://goessner.net/articles/JsonPath/)
- [AWS cli](https://aws.amazon.com/cli/)

## TODO

- Complete [Lab 8](../../labs/lab-08/README.md)
- Begin [Assignment 3](../../assignments/assignment-03/README.md)
