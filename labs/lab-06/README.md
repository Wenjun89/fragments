# Lab 6

This lab will introduce you to working with the Docker Registry, [Docker Hub](https://hub.docker.com/). We will learn how to `push` our Docker Images to [Docker Hub](https://hub.docker.com/), and how to `pull` and `run` these locally or on Amazon EC2 instances.

## Docker Hub Container Registry

In [Lab 5](../lab-05/README.md) we learned how to write a `Dockerfile` for our `fragments` service, and how to `build` and `tag` a Docker Image based on this `Dockerfile` and a **Build Context**. When we built our Docker Image in this way, the resulting Docker Image was available only on our local computer. We could `run` a new Docker Container based on this local Docker Image, but if we wanted to do the same on a remote computer (e.g., a cloud EC2 instance), we had to repeat the entire build process.

A better solution is to `push` our built Docker Image to a [Docker Container Registry](https://docs.docker.com/registry/). A Docker registry allows us to create **repositories**, which allow us to `push` (i.e. upload) and `pull` (i.e., download) Docker Images based on `tags`. The idea is similar to `git` and GitHub, where we `push` and `pull` source code commits, named with unique identifiers (commit sha, branch, tag, etc).

There are many Docker Container Registries that we can use, some public and some private. During this course we will focus on [Docker Hub](https://hub.docker.com/), which is arguably the most popular public registry, and [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/), which is tightly integrated into AWS.

## Docker Hub

In this lab, we'll focus on [Docker Hub](https://hub.docker.com/).

### [`docker pull`](https://docs.docker.com/engine/reference/commandline/pull/)

We've already been using [Docker Hub](https://hub.docker.com/) throughout this course. Consider the following Docker command that we've used in multiple examples:

```sh
docker run --rm -it ubuntu
```

The `ubuntu` Docker Image doesn't automatically exist on our local computer (i.e., we never built it), and when we run this command, Docker sees that the image doesn't exist and `pull`s it for us from a repository, <https://hub.docker.com/_/ubuntu>.

If we run that command two or more times, the second, third, etc. time we run it, the image is already cached locally, so it doesn't need to be downloaded again.

1. Try downloading (i.e., `pull`) the [hello-world Docker Image](https://hub.docker.com/_/hello-world) from [Docker Hub](https://hub.docker.com/):

   ```sh
   $ docker pull hello-world
   Using default tag: latest
   latest: Pulling from library/hello-world
   93288797bd35: Pull complete
   Digest: sha256:97a379f4f88575512824f3b352bc03cd75e239179eea0fecc38e597b2209f49a
   Status: Downloaded newer image for hello-world:latest
   docker.io/library/hello-world:latest
   ```

2. Take a look at your local Docker Images, and locate the `hello-world` image:

   ```sh
   $ docker images
   REPOSITORY                                      TAG             IMAGE ID       CREATED        SIZE
   ...
   hello-world                                     latest          18e5af790473   5 months ago   9.14kB
   ```

   NOTE: this shows the `REPOSITORY` name, the `TAG`, the unique `IMAGE ID`, its `CREATED` date, and `SIZE`.

3. Try running a new Docker Container based on this image, and notice how nothing gets downloaded (i.e., we already downloaded it with `pull`):

   ```sh
   $ docker run --rm hello-world

   Hello from Docker!
   This message shows that your installation appears to be working correctly.

   To generate this message, Docker took the following steps:
   1. The Docker client contacted the Docker daemon.
   2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
       (arm64v8)
   3. The Docker daemon created a new container from that image which runs the
       executable that produces the output you are currently reading.
   4. The Docker daemon streamed that output to the Docker client, which sent it
       to your terminal.

   To try something more ambitious, you can run an Ubuntu container with:
   $ docker run -it ubuntu bash

   Share images, automate workflows, and more with a free Docker ID:
   https://hub.docker.com/

   For more examples and ideas, visit:
   https://docs.docker.com/get-started/
   ```

4. If we remove this image locally (`docker rmi`), a subsequent `run` command will have to re-`pull` it:

   ```sh
   $ docker rmi hello-world
   Untagged: hello-world:latest
   Untagged: hello-world@sha256:97a379f4f88575512824f3b352bc03cd75e239179eea0fecc38e597b2209f49a
   Deleted: sha256:18e5af7904737ba5ef7fbbd7d59de5ebe6c4437907bd7fc436bf9b3ef3149ea9
   Deleted: sha256:64df1d35ad6c0c754bb2fb894dc41c8d22497dec795ee030971903774ad1c00d

   $ docker run --rm hello-world
   Unable to find image 'hello-world:latest' locally
   latest: Pulling from library/hello-world
   93288797bd35: Pull complete
   Digest: sha256:97a379f4f88575512824f3b352bc03cd75e239179eea0fecc38e597b2209f49a
   Status: Downloaded newer image for hello-world:latest

   Hello from Docker!
   This message shows that your installation appears to be working correctly.

   To generate this message, Docker took the following steps:
   1. The Docker client contacted the Docker daemon.
   2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
       (arm64v8)
   3. The Docker daemon created a new container from that image which runs the
       executable that produces the output you are currently reading.
   4. The Docker daemon streamed that output to the Docker client, which sent it
       to your terminal.

   To try something more ambitious, you can run an Ubuntu container with:
   $ docker run -it ubuntu bash

   Share images, automate workflows, and more with a free Docker ID:
   https://hub.docker.com/

   For more examples and ideas, visit:
   https://docs.docker.com/get-started/

   $ docker images
   REPOSITORY                                      TAG             IMAGE ID       CREATED        SIZE
   ...
   hello-world                                     latest          18e5af790473   5 months ago   9.14kB
   ```

### Creating Our Own Docker Hub Account and First Repository

[Docker Hub](https://hub.docker.com/) is free for individuals. You can use it to create an unlimited number of **public** repositories and **1 private repository** (NOTE: you can pay to create and host more private repositories if you ever want to).

1. Create an account for yourself on [Docker Hub](https://hub.docker.com/) by visiting <https://hub.docker.com/signup?redirectTo=/subscription%3Fplan%3Dfree>. Pick your **Docker ID** (i.e. your username), which is often the same as your GitHub username (but doesn't have to be). Then enter your **Email** and a **Password**, agree to the terms, captcha, and click **Sign Up**.

2. Once you have created your account and verified your email, click on your list of **Repositories** at <https://hub.docker.com/repositories>.

3. Create a new repository by clicking the **Create Repository** button. A [Docker Hub](https://hub.docker.com/) repository is named using your **Docker ID** and a repository **Name** in the following format: `docker-id/repo-name`. Use the name `fragments` for your repository **Name**, and enter a **Description** that describes this repository, (e.g., `Cloud Computing for Programmers: Fragments Microservice`). Our repository will be **Public**. Click the **Create** button.

4. Our public [Docker Hub](https://hub.docker.com/) `fragments` repository is now created and ready to host our Docker Images. Let's `build` a Docker Image for our `fragments` microservice:

   ```sh
   $ cd fragments
   $ docker build -t fragments .
   [+] Building 11.5s (12/12) FINISHED
   => [internal] load build definition from Dockerfile                                                                    0.2s
   => => transferring dockerfile: 906B                                                                                    0.2s
   => [internal] load .dockerignore                                                                                       0.1s
   => => transferring context: 34B                                                                                        0.1s
   => [internal] load metadata for docker.io/library/node:18.13.0                                                         0.8s
   => [auth] library/node:pull token for registry-1.docker.io                                                             0.0s
   => [1/6] FROM docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6fe9af408af05a34fe68cbfb   0.0s
   => => resolve docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6fe9af408af05a34fe68cbfb   0.0s
   => [internal] load build context                                                                                       0.1s
   => => transferring context: 1.25kB                                                                                     0.1s
   => CACHED [2/6] WORKDIR /app                                                                                           0.0s
   => CACHED [3/6] COPY package*.json .                                                                                   0.0s
   => [4/6] RUN npm install                                                                                               9.6s
   => [5/6] COPY ./src ./src                                                                                              0.0s
   => [6/6] COPY ./tests/.htpasswd ./tests/.htpasswd                                                                      0.0s
   => exporting to image                                                                                                  0.8s
   => => exporting layers                                                                                                 0.7s
   => => writing image sha256:0a0772488a44483a991147aa0d6a7cf5521a456b75f73f2027cd148747525905                            0.0s
   => => naming to docker.io/library/fragments                                                                            0.0s
   ```

5. We now have a Docker Image named `fragments`, with a tag of `latest` (i.e., `fragments:latest`). The `latest` tag is assumed if you don't explicitly name one. This doesn't match the name that [Docker Hub](https://hub.docker.com/) expects, which is of the form `docker-id/repo-name:tag`. Let's `tag` our existing `fragments` image with a second, new tag (replace `username` below with your **Docker ID**):

   ```sh
   docker tag fragments username/fragments
   ```

6. When we look at our local images, we can see the same Docker Image (i.e., same `IMAGE ID`) listed twice, but with two different `REPOSITORY` names:

   ```sh
   $ docker images
   REPOSITORY                                      TAG             IMAGE ID       CREATED        SIZE
   ...
   username/fragments                              latest          0a0772488a44   5 minutes ago   930MB
   fragments                                       latest          0a0772488a44   5 minutes ago   930MB
   ```

7. Let's add another `tag`. Additional tags take up no extra space, and provide us multiple ways to refer to an image. This is Lab 6, so let's use that as an additional tag (replace `username` below with your **Docker ID**):

   ```sh
   $ docker tag fragments username/fragments:lab-6

   $ docker images
   REPOSITORY                                      TAG             IMAGE ID       CREATED        SIZE
   ...
   username/fragments                              lab-6           0a0772488a44   5 minutes ago   930MB
   username/fragments                              latest          0a0772488a44   5 minutes ago   930MB
   fragments                                       latest          0a0772488a44   5 minutes ago   930MB
   ```

8. Before we can `push` to our [Docker Hub](https://hub.docker.com/) repository, we'll need to authenticate our `docker` CLI. We do this with the [docker login](https://docs.docker.com/engine/reference/commandline/login/) command (replace `<username>` and `<password>` with your [Docker Hub](https://hub.docker.com/) credentials):

   ```sh
   $ docker login --username <username> --password <password>
   WARNING! Using --password via the CLI is insecure. Use --password-stdin.
   Login Succeeded

   Logging in with your password grants your terminal complete access to your account.
   For better security, log in with a limited-privilege personal access token. Learn more at https://docs.docker.com/go/access-tokens/
   ```

   > [!NOTE]
   > Regarding the warning you see, we'll use an **access token** to authenticate in a later lab. For now, using your password is fine.

9. Now that we have properly tagged our image and logged our Docker client into [Docker Hub](https://hub.docker.com/), let's `push` our image to our [Docker Hub](https://hub.docker.com/) repository (replace `username` below with your **Docker ID**):

   ```sh
   $ docker push username/fragments
   Using default tag: latest
   The push refers to repository [docker.io/username/fragments]
   19b14f8ddced: Pushed
   20fd1c4da4b5: Pushed
   9d7235b311a7: Pushed
   46ed507c2568: Pushed
   7e635b74a1d2: Pushed
   8b49835c1b3d: Mounted from library/node
   b8d043e96649: Mounted from library/node
   046bce467327: Mounted from library/node
   3e970f5a8ef5: Mounted from library/node
   a08554eb77fd: Mounted from library/node
   3d6a0f7f806b: Mounted from library/node
   1a9388cb81f7: Mounted from library/node
   9f627e73d807: Mounted from library/node
   62994d6a7208: Mounted from library/node
   latest: digest: sha256:a27f20742a31849370a91608fd731087a686c662ea6fd16fc50b112a3c41e61c size: 3258
   ```

10. Visit your [Docker Hub](https://hub.docker.com/) repository at `https://hub.docker.com/repository/docker/<username>/fragments` (replace `username` below with your **Docker ID**). You should see your `latest` tag listed. However, our `lab-6` tag is not there. When we called `push` above, it only saw us referring to `username/fragments:latest` (remember, if you omit a tag, `:latest` is assumed). Let's fix that by pushing again with the `lab-6` tag (replace `username` below with your **Docker ID**):

    ```sh
    docker push username/fragments:lab-6
    The push refers to repository [docker.io/username/fragments]
    19b14f8ddced: Layer already exists
    20fd1c4da4b5: Layer already exists
    9d7235b311a7: Layer already exists
    46ed507c2568: Layer already exists
    7e635b74a1d2: Layer already exists
    8b49835c1b3d: Layer already exists
    b8d043e96649: Layer already exists
    046bce467327: Layer already exists
    3e970f5a8ef5: Layer already exists
    a08554eb77fd: Layer already exists
    3d6a0f7f806b: Layer already exists
    1a9388cb81f7: Layer already exists
    9f627e73d807: Layer already exists
    62994d6a7208: Layer already exists
    lab-6: digest: sha256:a27f20742a31849370a91608fd731087a686c662ea6fd16fc50b112a3c41e61c size: 3258
    ```

    This should go much quicker, since all of your layers are already uploaded to [Docker Hub](https://hub.docker.com/). Look at your repository on the web again, and confirm that your `lab-6` tag is there along with `latest`.

11. We can also `tag` our image when we `build` [using one or more tags](https://docs.docker.com/engine/reference/commandline/build/#tag-an-image--t). Let's do another `build` and tag our image with 3 different tags: 1) `latest`; 2) `lab-6`; and 3) the [git `sha` of our commit](https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection) (e.g., `90f91544d9d1b8d271fc8a793076ad996045ae21` or just the first 7 characters `90f9154` for short). Use `git show` to get the commit sha for your `fragments` repo, then do another build (replace `username` and `90f9154` with your own info). We'll `push --all-tags` at once so we don't have to run 3 separate `push` commands for each of the three tags:

    ```sh
    $ docker build -t username/fragments:latest -t username/fragments:lab-6 -t username/fragments:90f9154 .
    ...
    $ docker push --all-tags user/fragments
    ```

    Confirm that your [Docker Hub](https://hub.docker.com/) repository shows all of your repository's tags.

## Running a Container on EC2 Using Docker Hub

Now that your image is tagged and hosted on a public [Docker Hub](https://hub.docker.com/) repository, we can easily run a new Docker Container based on it using an Amazon EC2 instance.

1. Using what you learned in [Lab 4](../lab-04/README.md), start or create a new EC2 instance.

2. Once your EC2 instance is started, connect to it using `ssh` or PuTTY and the SSH key pair you created in a previous lab.

3. Follow the [AWS EC2 Docker instructions to install `docker`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html#install-docker-instructions) on your EC2 instance, if it's not already there.

4. In previous labs, this is when you'd install `node.js` and copy a **tarball** of our project's **source code** to the EC2 instance. In this case, we don't need to bother with these steps, since our project's code and runtime are both available as a Docker Image. You can now `run` a new container based on the image you pushed to your [Docker Hub](https://hub.docker.com/) repository `username/fragments:lab-6`. Use what you learned in [Lab 5](../lab-05/README.md) steps 14 onward if you need a reminder, and run your `fragments` server as a container based on your `username/fragments:lab-6` image.

## Improve your Code and Push New Images and Tags

1. Pick a few `Dockerfile` optimizations from this week's lecture and discussion to implement in your `fragments` Dockerfile (e.g., multi-stage builds). Once you have made these optimizations, `commit` and `push` them to GitHub, then `build`, `tag`, and `push` a new Docker image to your [Docker Hub](https://hub.docker.com/) repository. Use the tags: `latest`, `lab-6`, and `lab-6-step-20`.

2. Pick one requirement from the [Assignment 2](../../assignments/assignment-02/README.md) requirements list for the `fragments` microservice and do an initial implementation of it (it doesn't need to be perfect). Once you have implemented the changes, `commit` and `push` them to GitHub, then `build`, `tag`, and `push` a new Docker image to your [Docker Hub](https://hub.docker.com/) repository. Use the tags: `latest`, `lab-6`, and `lab-6-step-21`.

## Submission

1. Link to your updated `fragments` microservice `Dockerfile` on GitHub, showing your optimizations from step 20 above.
2. Link to your [Docker Hub](https://hub.docker.com/) `fragments` repository
3. Screenshot of all of the expected Docker **Tags** in your [Docker Hub](https://hub.docker.com/) repository (see the **Tags** tab)
4. Screenshot of an EC2 instance running your `fragments` [Docker Hub](https://hub.docker.com/) image.
5. Explanation of the optimizations and requirement you implemented in steps 20 and 21. Include screenshots, text, code, or whatever you need in order to prove that it's been done.
6. Screenshot showing that you have stopped your EC2 instance, now that the lab is complete.
7. Screenshot of your current account costs in the AWS Console
