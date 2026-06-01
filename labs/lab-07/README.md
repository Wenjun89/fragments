# Lab 7

In this lab we will lay the foundations for a Continuous Delivery pipeline, and set up automation for our Docker builds, pushing them to various registries. In so doing, we will work with [Docker Hub](https://hub.docker.com/) and [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/), as well as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) and various Actions from the [GitHub Actions Marketplace](https://github.com/marketplace?type=actions).

## Adding Docker to CI

We have already created a Continuous Integration workflow in `.github/workflows/ci.yml`, which we use to build and test every commit on the `main` branch. We will now extend it to add two new features:

1. Dockerfile Linting with [Hadolint](https://github.com/hadolint/hadolint)
2. Automatically Build and Push a Docker Image of our `main` branch to [Docker Hub](https://hub.docker.com/)

### 1. Linting Dockerfiles

Since we are about to start publishing our Docker images to registries, it's important that we trust the quality of our Dockerfile. We already know that there are many [best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) for writing Dockerfiles, and we'd like to make sure that our code follows them.

Static analysis tools help us validate and verify our source code. We already do this for our JavaScript code with [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/). Now we'll add a process for linting our Dockerfile.

#### Hadolint

[Hadolint](https://github.com/hadolint/hadolint) is a tool that parses a Dockerfile and then checks it against a set of [rules](https://github.com/hadolint/hadolint#rules). If any of these rules are broken, a warning or error message is displayed, and the tool exits with an error code.

1. [Install Hadolint](https://github.com/hadolint/hadolint#install) locally, or use via Docker, to help you check your Dockerfile without having to rely so much on your GitHub Actions CI Workflow. NOTE: whenever possible, developers should be able to run any automated checks in a CI workflow locally.

2. [Run Hadolint](https://github.com/hadolint/hadolint#how-to-use) on your `fragments` server's Dockerfile and **take a screenshot** (you'll need this for submission):

```sh
cd fragments
hadolint Dockerfile
```

Fix any warnings or errors you see, referring to the [Hadolint rules](https://github.com/hadolint/hadolint#rules). Keep running `hadolint Dockerfile` until you get no warnings or errors (NOTE: most Unix tools print nothing when they work as expected).

1. Add a `dockerfile-lint` job to the list of `jobs` in your `.github/workflows/ci.yml` file, between the existing `lint` and `unit-tests` jobs. In it we'll use the [hadolint/hadolint-action](https://github.com/hadolint/hadolint-action) to set up and run [Hadolint](https://github.com/hadolint/hadolint) for us:

```yml
jobs:
  lint: ...

  # Lint our Dockerfile using Hadolint
  dockerfile-lint:
    name: Dockerfile Lint
    runs-on: ubuntu-latest
    steps:
      # https://github.com/marketplace/actions/hadolint-action
      - uses: actions/checkout@v6
      - uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile

  unit-tests: ...
```

1. Use git to `add`, `commit`, and `push` to GitHub and trigger a new CI Actions run. Make sure that your `Dockerfile Lint` job is successful. If it isn't, fix any warnings or errors, `add`, `commit`, and `push` again, and repeat until you have a clean run.

### 2. Automatically Build and Push to Docker Hub

Whenever we merge new code into the `main` branch, it's nice to have an easy way to run that code. A simple way to achieve this is to `build` a Docker Image of our commit and `push` it to a registry like [Docker Hub](https://hub.docker.com/). In a previous lab we did this manually, and now we'll automate the process to happen on every `push` via our CI workflow.

1. At the bottom of `.github/workflows/ci.yml`, add a fourth job named `docker-hub`, which will use Docker's [build-push](https://github.com/docker/build-push-action) action. This `docker-hub` job will depend on the other three jobs succeeding: if we don't pass `lint`, `unit-tests`, or `dockerfile-lint`, we won't bother building and pushing our Docker Image. We do that by adding a [`needs` property](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idneeds) to our job:

```yml
docker-hub:
  name: Build and Push to Docker Hub
  # Don't bother running this job unless the other three all pass
  needs: [lint, dockerfile-lint, unit-tests]
  runs-on: ubuntu-latest
  steps:
```

1. The [build-push](https://github.com/docker/build-push-action) action requires us to [set up our environment](https://github.com/docker/build-push-action#usage) so that we can build properly and authenticate with Docker Hub.

```yml
steps:
  # Set up buildx for optimal Docker Builds, see:
  # https://github.com/docker/setup-buildx-action
  - name: Set up Docker Buildx
    uses: docker/setup-buildx-action@v4

  # Login to Docker Hub using GitHub secrets, see:
  # https://github.com/docker/login-action
  - name: Login to DockerHub
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Notice that we are providing a `username` and `password`, but using variables `${{ ... }}` instead of hard-coding values. Also notice that those variable names are prefixed with `secrets.*` These are [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), which we must add to our repository.

1. In order to have our GitHub Actions login to [Docker Hub](https://hub.docker.com/), we have to provide a `username` and `password`. We could just type these values directly into our `ci.yml` file, but doing so would break a cardinal rule of git and GitHub: **no secrets in source code**. Instead we need to [create encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) for our repository. In GitHub, go to your `fragments` repo, **Settings** > **Secrets** > **Actions** > **New repository secret**. In the **Name** section, enter `DOCKERHUB_USERNAME` in **ALL CAPS** and `SNAKE_CASE` (i.e., with an underscore). Click **Add secret**. This is the last time you, or anyone, will able to view this value, as it will be stored in GitHub as encrypted text.

2. Next we need to add our password. We could use our [Docker Hub](https://hub.docker.com/) password, but a better option is to create an [Access Token](https://docs.docker.com/docker-hub/access-tokens/). An [Access Token](https://docs.docker.com/docker-hub/access-tokens/) works like a password, but can be managed separate to our real password (i.e., we can give it to GitHub and later revoke it, without having to change our real password). Login to [Docker Hub](https://hub.docker.com/) and go to your **Account Settings** and the **Security** [menu option](https://hub.docker.com/settings/security). Click **New Access Token**. Enter a **Description** for your token, for example: **Docker Hub Access Token for CI**. Select the **Access permissions**: **Read, Write, Delete**. Click **Generate**. Your [Access Token](https://docs.docker.com/docker-hub/access-tokens/) will be shown to you now, and you **must** copy it and save it somewhere safe, treating it like any other password. **You will not be able to see it again!** NOTE: Docker Hub limits the number and kind of Access Tokens we can create with a free account.

3. Back in your `fragments` GitHub repo, add a second GitHub Actions Repository Secret, named `DOCKERHUB_TOKEN` and use the value you just received from Docker Hub for your [Access Token](https://docs.docker.com/docker-hub/access-tokens/).

4. Add another `step` to your `docker-hub` job to `build` and `push` your Docker Image to [Docker Hub](https://hub.docker.com/). We'll define an [environment variable](https://docs.github.com/en/actions/learn-github-actions/environment-variables) for our repo name, `DOCKERHUB_REPO`, which we can use multiple times. We'll also define multiple tags for this image: one will indicate the git commit SHA that we are building (useful if we want to go back later and run an old commit to test or debug something); another that this is for the current commit on the `main` branch; and finally that this is the `latest` image we've built for the repo:

```yml
steps:
  ...

  # Build and Push an Image to Docker Hub
  - name: Build and push
    env:
      # Define an Environment Variable with our Docker Hub Repo
      # Replace `username` with your Docker Hub username and `fragments
      # with whatever you've named your Docker Hub repo
      DOCKERHUB_REPO: username/fragments
      # Define an Environment Variable with the current git commit's
      # sha: sha-87f664e01bb5f242faa411e9e7fb9e75a58ae767
      # Use the `github` context to get this, see:
      # https://docs.github.com/en/actions/learn-github-actions/contexts#github-context
      SHA_TAG: sha-${{ github.sha }}
    uses: docker/build-push-action@v7
    with:
      push: true
      # Use 3 tags :sha-sha-7d821bd14e0d6c381dc57a5369ae1a3a9220664f, :main, and :latest
      tags: ${{ env.DOCKERHUB_REPO }}:${{ env.SHA_TAG }}, ${{ env.DOCKERHUB_REPO }}:main, ${{ env.DOCKERHUB_REPO }}:latest
```

1. Switch over to [Docker Hub](https://hub.docker.com/) and make sure you can see the expected three **Tags** for your `fragments` repo. **Take a screenshot** for your submission.

## Add a CD Workflow

Our CI workflow is in good shape, and it's time to start thinking about creating a **Continuous Delivery** workflow. Unlike our CI workflow, the CD workflow will (eventually) focus on deploying our code so that we can test it in a production-like environment.

In this week's lab, we'll create the initial parts of this CD workflow, including building and pushing our server's Docker image to a private Docker repository hosted on the [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/).

_NOTE: we could use Docker Hub for our CD workflow as well (i.e., we already have a build-push style workflow created). However, it's important for you to learn how to work with different registries, both public and private._

### Amazon Elastic Container Registry

1. Open the **AWS Console** and search for [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/).

2. Under **Create a repository**, click the **Get Started** button.

3. Create a **Private** repo with a **Repository Name** of `fragments`. Make a note of the full repository URI, which will be something like `4xxxxxxxxxx5.dkr.ecr.us-east-2.amazonaws.com/fragments` (the `4xxxxxxxxxx5` will be your **AWS Account ID**, which [isn't a secret](https://www.lastweekinaws.com/blog/are-aws-account-ids-sensitive-information/)). You can leave **Tag Immutability** disabled (i.e., we will reuse tags like `latest`). Click **Create repository**.

### AWS and GitHub Actions

1. Create 2 new GitHub Actions Secrets in your `fragments` repo, using the values you obtained for your AWS CloudLabs account when you first launched the lab:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

1. On your local machine, in your `fragments` repo, create a new file, `.github/workflows/cd.yml` for your CD workflow. This file will run whenever we `push` a new git `tag`:

```yml
# Continuous Delivery Workflow
#
# This should happen whenever we push a new tag, and we tag an existing
# commit after we know it's good (e.g., has been tested).
#
# To create a new tag, we also need to update the package.json version:
#
# $ npm version 0.5.0
#
# This will update `version` in package.json to `0.5.0` and create a new
# tag, `v0.5.0` in git. We'll then use this tag (i.e., `v0.5.0`) to tag
# our docker image before we push to AWS.
name: cd

on:
  push:
    # Whenever a new tag is pushed
    tags:
      # Any tag starting with v... should trigger this workflow.
      - 'v**'

jobs:
  # NOTE: this assumes our CI jobs have already passed previously
  # (i.e., that we don't tag a commit manually until we know a build is working)
  aws:
    name: AWS
    runs-on: ubuntu-latest
    steps:
```

1. Our first step is to `checkout` the code from git, since we need to build a new Docker image from it:

```yml
steps:
  - name: Check out code
    uses: actions/checkout@v6
```

1. Similar to how we automated our build for Docker Hub, we need to set up the [buildx plugin](https://docs.docker.com/buildx/working-with-buildx/):

```yml
steps:
  ...
  # Use buildx, which is faster and can optimize the build steps
  - name: Set up Docker Buildx
    uses: docker/setup-buildx-action@v4
```

1. Next we need to login the `docker` client with our [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/) registry. This requires a slightly different set of steps than we used with Docker Hub. We'll use the [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) and [aws-actions/amazon-ecr-login](https://github.com/aws-actions/amazon-ecr-login) actions to exchange our AWS credential secrets for a temporary password token:

```yml
steps:
  ...
  - name: Configure AWS Credentials using Secrets
    uses: aws-actions/configure-aws-credentials@v4
    with:
      # Use our GitHub Encrypted Secrets via secrets.*
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      # Hard-code our region, which isn't a secret, and won't change
      aws-region: us-east-2

  # Login to our ECR repository using the configured credentials
  - name: Login to Amazon ECR
    id: login-ecr
    uses: aws-actions/amazon-ecr-login@v2
```

1. Finally, we need to `build` and `push` an image to our [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/) registry. Like we did with [Docker Hub](https://hub.docker.com/) before, we can once again use the [build-push](https://github.com/docker/build-push-action) action. However, we'll need to modify a few things. First, we'll need to obtain the [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/) registry URI from our previous login step. In GitHub Actions, we do this with [`outputs.*`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idoutputs) for steps by their `id`. Second, we'll use the `latest` tag, but also add a second tag based on the git tag's version. This will allow us to keep track of the images for all of our releases (i.e., all of our git tags). We can do that by accessing the `ref_name` on the [`github` context](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context):

```yml
steps:
  ...
  # Build and Push an Image to Amazon ECR
  - name: Build and push to Amazon ECR
    env:
      # Define an Environment Variable with our ECR Registry, getting
      # the value from the previous step's outputs
      ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
      # Define an Environment Variable with our ECR Repository Name
      ECR_REPO: fragments
      # We'll give this image two different tags. First, we'll use the git tag (vX.Y.Z)
      # so that we can always go back and re-create this setup again in the future
      # if we have to test or debug something. Second, we'll also replace the
      # `latest` tag, since this is our most up-to-date version.
      VERSION_TAG: ${{ github.ref_name }}
    uses: docker/build-push-action@v7
    with:
      push: true
      # Use the git tag version and `latest`
      tags: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPO }}:${{ env.VERSION_TAG }}, ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPO }}:latest
```

1. You should `add`, `commit`, and `push` your `.github/workflows/cd.yml` file at this point.

### Tagging Releases

Whenever we want to create a new release, and have our CD workflow build and publish it to the [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/), we need to create a new [git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging). A git tag is a human-readable name (usually a version like `v1.2.3`) for a particular git commit. Tags are similar to branches (e.g., `main`); however, while branches move forward when we add new commits, tags remain in place forever. A branch describes an active line of development (i.e., one that is changing), while a tag describes a version of the code from the past.

In a node.js project, we also record our [`version` in the `package.json` file](https://docs.npmjs.com/about-semantic-versioning). The `npm` command has a useful sub-command named `version` that is used to update the version in `package.json` _and also_ create a new git tag at the same time.

> [!IMPORTANT]
> You should only create a new tag when you know that this particular version of the code (i.e., this current commit you are about to tag) is "good" (e.g., has passed CI, can be run, etc).

1. Confirm that your current commit, and the most recent commit built by your CI workflow are the same (i.e., use `git show` or `git log` to see which commit you are on, and compare it to your latest GitHub Actions workflow). If your CI workflow is not green, fix whatever problems you have and `push` your changes. Repeat until you have a clean (i.e., green) run.

2. Examine your `package.json` file and see which version you are currently on. We need to create a new version, and it should be larger than the previous version. Depending on what we are doing in this release, we choose a new version that represents those changes: `1.x.x` is a **MAJOR** change, and means you are breaking API compatibility; `x.1.x` is a **MINOR** change, and means your changes are backward compatible (e.g., adding a feature or more tests); `x.x.1` is a **PATCH** change, and means that your changes are backward compatible (e.g., fixing a bug). Each of these numbers can go as big as you want: `1.0.0` and `50.376.1` are both valid versions. Because we have not yet completed our `fragments` server, you should use a version less than `1.0.0`. You could use `0.7.0` since this is Lab 7, but it's up to you:

```sh
npm version 0.7.0 -m "Release v0.7.0"
```

1. Confirm that your `package.json` has a `version` of `0.7.0`, or whatever version you just used.

2. Confirm that you have a `v0.7.0` tag in git, and also examine the `log` to see this new tag being created:

```sh
git tag
git log
```

1. Push your new tag to GitHub. By default, tags are **not** included when you push, so you have to do it manually using the `--tags` flag:

```sh
git push origin main --tags
```

1. Switch over to GitHub and watch your CD workflow run. Make sure that it is able to configure your AWS credentials, login to ECR, and build and push your Docker image. If you have issues, correct them, create a new **PATCH** tag (e.g., `0.7.0` -> `0.7.1`) and try again. Repeat until you are successful. **Take a screenshot**, which you'll need for submission.

2. Switch over to your [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/), and navigate to your `fragments` repo. Click on the `fragments` repo and confirm that the **Images** section includes your recent build with the expected tags. **Take a screenshot**, which you'll need for submission.

## Validating your Images

1. On your **local machine**, use `docker` to `run` your `fragments` server via the `main` tag built by GitHub Actions on your [Docker Hub](https://hub.docker.com/) `fragments` repo. Use the browser or `curl` to access the health check route. **Take a screenshot**, which you'll need for submission.

2. On an **EC2 instance**, use `docker` to `run` your `fragments` server via the `v0.7.0` tag (or whatever your last successfully tagged image was) built by GitHub Actions on your [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/) `fragments` repo. Doing so will require you to first login the `docker` client with your [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/). The `aws` CLI provides a way to get a temporary password that we can pipe to `docker`. _NOTE: a previous version of this lab gave instructions for the AWS CLI v1 vs. v2, and the instructions have changed._

The following commands **must** be run on your EC2 instance:

```sh
# Define Environment Variables for all AWS Credentials.  Use the CloudLabs AWS CLI Credentials:
$ export AWS_ACCESS_KEY_ID=<cloudlabs-access-key-id>
$ export AWS_SECRET_ACCESS_KEY=<cloudlabs-secret-access-key>
$ export AWS_DEFAULT_REGION=us-east-2

# Login the EC2's docker client, swapping your full ECR registry name
$ docker login -u AWS -p $(aws ecr get-login-password --region us-east-2) 4xxxxxxxxxx5.dkr.ecr.us-east-2.amazonaws.com
```

1. You should now be able to use regular `docker` commands (e.g, `run`) to interact with your [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/). Use the browser or `curl` to access the health check route, which should show your updated version (i.e., from `package.json`). **Take a screenshot**, which you'll need for submission.

## Submission

1. Screenshot of the first time you ran Hadolint on your Dockerfile, showing any warnings or errors you had to correct.
2. Screenshot of a successful CI workflow, showing your new `Dockerfile Lint` and `Docker Hub` jobs succeeding.
3. Screenshot of your `main` and `latest` **Tags** in [Docker Hub](https://hub.docker.com/), created by your GitHub Actions `ci.yml` workflow.
4. Screenshot of a successful CD workflow, showing your AWS login, build and push jobs succeeding.
5. Screenshot of your [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/) showing your `fragments` **Image** and **tags**, built via GitHub Actions.
6. Screenshot of your local machine running the `main` image from [Docker Hub](https://hub.docker.com/), built and pushed by your GitHub Actions `ci.yml` workflow.
7. Screenshot of EC2 instance running the `v0.7.0` image (or your latest version tag) your [Amazon Elastic Container Registry](https://aws.amazon.com/ecr/) and `fragments` repo, built and pushed by your GitHub Actions `cd.yml` workflow.
8. Screenshot showing that you have stopped your EC2 instance, now that the lab is complete.
9. Screenshot of your current account costs in the AWS Console
