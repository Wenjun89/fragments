# Week 8

## Lectures

1. [Continuous Delivery, Docker Registries, and GitHub Actions](./continuous-delivery.md)

## Readings and References

- [Continuous Delivery](https://continuousdelivery.com/)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [GitHub CLI](https://github.com/cli/cli) and [`gh secret`](https://cli.github.com/manual/gh_secret)
- Tags
  - [`docker tag`](https://docs.docker.com/engine/reference/commandline/tag/)
  - [`docker build -t`](https://docs.docker.com/engine/reference/commandline/build/#tag-an-image--t)
  - [`git tag`](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
  - [`npm version`](https://docs.npmjs.com/cli/v7/commands/npm-version) and [Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning)
- [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/)
- [Hadolint](https://github.com/hadolint/hadolint) for linting Dockerfiles using various [rules](https://github.com/hadolint/hadolint#rules)
- More GitHub Actions Syntax
  - [`needs` property](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds)
  - [environment variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)
  - [`github` context](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context)
  - [`outputs.*`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idoutputs)
- GitHub Actions
  - [hadolint/hadolint-action](https://github.com/hadolint/hadolint-action)
  - [docker/setup-buildx-action](https://github.com/docker/setup-buildx-action)
  - [docker/login-action](https://github.com/docker/login-action)
  - [docker/build-push](https://github.com/docker/build-push-action)
  - [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
  - [aws-actions/amazon-ecr-login](https://github.com/aws-actions/amazon-ecr-login)
- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)

## TODO

- Complete [Lab 7](../../labs/lab-07/README.md)
- Continue working on [Assignment 2](../../assignments/assignment-02/README.md)
