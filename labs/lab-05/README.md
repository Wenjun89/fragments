# Lab 5

This is lab will introduce you to `Dockerfiles` and how to "Dockerize" a node.js server. A `Dockerfile` defines a set of **instructions** used by the Docker Engine to create a Docker Image. This Docker Image can be used to create a running Docker Container.

This will be our first attempt at writing a `Dockerfile`, and in subsequent weeks we'll improve our approach to be more efficient, secure, and reduce the overall size or our resulting image. However, for this week, our goal is to focus on learning the syntax of `Dockerfile` instructions.

## Install Dependencies

1. If you haven't done so already, begin by [installing Docker](https://docs.docker.com/get-docker/). This will give you **Docker Desktop**, the `docker` cli command, the Docker Engine, etc.

You will also need the [Docker Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker). We'll use this to visually interact with our running container.

## Dockerize `fragments` Microservice

1. In the root of your `fragments` microservice project, create a new file named `Dockerfile`. NOTE: the capital `D` is intentional, and there is no extension. This is a text file that will define all of the Docker **instructions** necessary for Docker Engine to build an image of your service.

2. At the very top of your file, add a comment that explains what this file is. A comment in a `Dockerfile` begins with a `#`. You can (and should) include as many comment lines as you think are necessary to explain how your code works. Especially while you are learning, this is a great opportunity to write yourself notes about why you did certain things, give links to documentation, and explain things that may not be obvious. You can also use **blank lines**, which Docker will ignore, but are useful for breaking up the file in order to make it more readable. Having comments and vertical whitespace is important for maintainability.

3. Every `Dockerfile` must begin with a [`FROM` instruction](https://docs.docker.com/engine/reference/builder/#from). This specifies the parent (or _base_) image to use as a starting point for our own image. Our `fragments` image will be _based_ on other Docker images. This helps us avoid duplicating work across projects. For example, we could base our Dockerfile on an image like [ubuntu](https://hub.docker.com/_/ubuntu) or [amazonlinux](https://hub.docker.com/_/amazonlinux). However, doing so would mean that we'd have to manually install and configure things like `node.js`, which our service requires. A better option is to pick one of the official [node](https://hub.docker.com/_/node) base images, which already has node.js plus everything else we need:

   ```dockerfile
   FROM node
   ```

   Saying that we want to use `node` would work. However, this doesn't specify a particular version of node. We do that by adding a `:tag`, for example: `node:18` or `node:lts`. Because we are trying to make sure that our image is as close to our development environment as possible, we want to use a **specific** version. You can be very specific if you need to be:

   ```dockerfile
   # Use node version 22.12.0
   FROM node:22.12.0
   ```

   Pick a version that closely matches the node version you are using locally (i.e., `node --version` will tell you). As we continue to develop our project, and as node.js makes new releases, we will update this version accordingly. Our current choice is only for **this** image, and we will make more images later.

4. After your `FROM` instruction, leave a blank line then define some metadata about your image. The [`LABEL` instruction](https://docs.docker.com/engine/reference/builder/#label) adds `key=value` pairs with arbitrary metadata about your image. For example, you can indicate who is maintaining this image (you are, so use your name/email), and what this image is for. Here's an example, which you can update for your own project:

   ```dockerfile
   LABEL maintainer="Kim Lee <klee@example.com>"
   LABEL description="Fragments node.js microservice"
   ```

5. Leave another blank like, then define any **environment variables** you want to include. We define environment variables using the [`ENV` instruction](https://docs.docker.com/engine/reference/builder/#env), which also uses `key=value` pairs like `LABEL`. Environment variables become part of the built image, and will persist in any containers run using this image. We'll provide default values, but they can be overridden at runtime using [the `--env`, `-e` or `--env-file` flags](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file). You can define variables for your application, but also for your build/runtime tools:

   ```dockerfile
   # We default to use port 8080 in our service
   ENV PORT=8080

   # Reduce npm spam when installing within Docker
   # https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
   ENV NPM_CONFIG_LOGLEVEL=warn

   # Disable colour when run inside Docker
   # https://docs.npmjs.com/cli/v8/using-npm/config#color
   ENV NPM_CONFIG_COLOR=false
   ```

   NOTE: we haven't included some environment variables that don't make sense in a `Dockerfile`. For example, we don't want to include secrets, nor do we want to define things that will always be different. These we can define at run-time instead of build-time. Our Amazon Cognito variables are a good example of something that we can't put in the `Dockerfile`, since they will always be different.

6. Leave another blank like, then define and create our app's **working directory**. The base images we use (e.g., `node`) will already define a filesystem for us (i.e., a Linux distro with node.js installed). However, we need to create a directory for our application. This can be named and located whatever you want in the existing filesystem. A logical place might be `/app`: an `app` directory in the root:

   ```dockerfile
   # Use /app as our working directory
   WORKDIR /app
   ```

   This will create the `/app` directory, since it won't exist, and then enter it (i.e., `cd /app`), so that all subsequent commands will be relative to `/app`. You can use the [`WORKDIR` instruction](https://docs.docker.com/engine/reference/builder/#workdir) as many times as you need to in your `Dockerfile`.

7. Leave another blank line, then **copy** your application's `package.json` and `package-lock.json` files into the image. Our project depends on many dependencies (defined in `package.json`) and these dependencies also have dependencies at a specific version (defined in `package-lock.json`). We use the [`COPY` instruction](https://docs.docker.com/engine/reference/builder/#copy) to copy files and folders into our image. In its most basic form, we use `COPY <src> <dest>`. This copies from the **build context** (i.e. our `<src>`) to a path inside the image (i.e., our `<dest>`). The build context includes all of the files and directories in and below the path where `docker build` is run. This will typically be in the same directory as the `Dockerfile`.

The syntax for how we define the `<src>` and `<dest>` in a `COPY` instruction can differ. Here are some examples of different ways we could write it. All of these accomplish the same thing, but they are written differently:

```dockerfile
# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/
```

```dockerfile
# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./
```

```dockerfile
# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json ./
```

1. Leave another blank line, then we need to install our dependencies. We use the [`RUN` instruction](https://docs.docker.com/engine/reference/builder/#run) to execute a command and cache this layer (i.e., we can reuse it later if `package.json`/`package-lock.json` haven't changed):

```dockerfile
# Install node dependencies defined in package-lock.json
RUN npm install
```

1. Leave another blank line, then copy your server's source code into the image. All of our code is conveniently located in a `src/` directory, and we need to end up with our code at `/app/src`. We can do that with:

   ```dockerfile
   # Copy src to /app/src/
   COPY ./src ./src
   ```

2. Our final step is to define the command to run in order to start our container. A Docker container is really a single **process**, and we need to tell Docker how to start this process. In our case, we can do that with the command `npm start`, and we use the [`CMD` instruction](https://docs.docker.com/engine/reference/builder/#cmd) to define it:

   ```dockerfile
   # Start the container by running our server
   CMD npm start
   ```

   > [!NOTE]
   > One final instruction that many server containers include is `EXPOSE`. We use `EXPOSE` in order to indicate the port(s) that a container will listen on when run. For example, a web server might `EXPOSE 80`, indicating that port `80` is the typical port used by this container. Users of the container are free to publish different ports on the host (e.g., use port `8000` on the host and `80` in the container: `-p 8000:80`). The `EXPOSE` instruction is mostly for documentation:

   ```dockerfile
   # We run our service on port 8080
   EXPOSE 8080
   ```

## `.dockerignore`

1. We're almost ready to try building our image, and running a container based on it. Our final step is to limit the size of our build context. As we said earlier, the build context includes all of the files and directories reachable beneath the location where we call `docker build`. Typically, that's the in the same directory as your `Dockerfile`. If we don't specify any files to ignore, Docker will send **everything** from this directory down to the Docker Daemon. However, there are things we don't need to send. For example, `.git/` directory, our `node_modules/` directory, `coverage/`, `.vscode/`, and other files and directories unnecessary to our build. Spend a minute looking at all the files and directories in the root of your project, and think about whether or not you need them in the container.

   Create a new file in the root of your `fragments` project named [`.dockerignore`](https://docs.docker.com/engine/reference/builder/#dockerignore-file). This file is similar to your `.gitignore` or `.prettierignore` files. There are lots of things that we don't need when we build this container:

   ```dockerignore
   .github/
   .vscode/
   coverage/
   node_modules/
   tests/
   .env
   eslint.config.mjs
   .git/
   .gitignore
   .prettier*
   jest*
   ```

## `docker build`

1. We're ready to build our image. Make sure that you've started Docker Desktop (i.e., the Docker Engine has to be running), then execute the [`docker build -t fragments:latest .`](https://docs.docker.com/engine/reference/commandline/build/) command in a terminal:

   ```sh
   $ cd fragments
   docker build -t fragments:latest .

   [+] Building 13.8s (11/11) FINISHED
   => [internal] load build definition from Dockerfile                                             0.3s
   => => transferring dockerfile: 793B                                                             0.3s
   => [internal] load .dockerignore                                                                0.2s
   => => transferring context: 141B                                                                0.2s
   => [internal] load metadata for docker.io/library/node:18.13.0                                  2.2s
   => [auth] library/node:pull token for registry-1.docker.io                                      0.0s
   => [internal] load build context                                                                0.1s
   => => transferring context: 470.05kB                                                            0.0s
   => CACHED [1/5] FROM docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202  0.0s
   => => resolve docker.io/library/node:16.15.1@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6f  0.0s
   => [2/5] WORKDIR /app                                                                           0.2s
   => [3/5] COPY package*.json .                                                                   0.0s
   => [4/5] RUN npm install                                                                        10.2s
   => [5/5] COPY ./src ./src                                                                       0.0s
   => exporting to image                                                                           0.8s
   => => exporting layers                                                                          0.8s
   => => writing image sha256:a172170090d2b93328b183256a4fee1fc318c7ad6fde7d8b5cd4ceea4d629ada     0.0s
   => => naming to docker.io/library/fragments:latest                                              0.0s
   ```

   This command will `build` the Dockerfile located in the current directory (i.e., `.`). We're also giving it a [`tag`](https://docs.docker.com/engine/reference/commandline/build/#tag-an-image--t) using `-t fragments:latest`, which defines a name (i.e., `fragments`) and a version (i.e., `latest`). We often use the `latest` version as a way to indicate that this is the most recent version of our image. The next time we update and rebuild our image, we'll use `latest` again.

   Confirm that you can see your built image using the [`docker image ls` command](https://docs.docker.com/engine/reference/commandline/image_ls/):

   ```sh
   $ docker image ls fragments

   REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
   fragments    latest    a172170090d2   2 minutes ago   930MB
   ```

   As you can see, our image isn't small (mine is nearly a gigabyte at `930MB`), since it includes our source code, dependencies, node.js, etc. In other words, it has everything we need in order to run our server--the entire runtime environment.

## Environment Variables

1. Let's run it. We do that with the [`docker run` command](https://docs.docker.com/engine/reference/commandline/run/):

   ```sh
   docker run --rm --name fragments-{your-github-username} fragments:latest

   > fragments@0.0.1 start
   > node src/index.js

   {"level":60,"time":1644603889378,"pid":21,"hostname":"738a22eb752a","err":{"type":"Error","message":"missing env vars: no authorization configuration found","stack":"Error: missing env vars: no authorization configuration found\n    at Object.<anonymous> (/app/src/auth/index.js:11:9)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)\n    at Module.load (node:internal/modules/cjs/loader:981:32)\n    at Function.Module._load (node:internal/modules/cjs/loader:822:12)\n    at Module.require (node:internal/modules/cjs/loader:1005:19)\n    at require (node:internal/modules/cjs/helpers:102:18)\n    at Object.<anonymous> (/app/src/app.js:14:23)\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)"},"origin":"uncaughtException","msg":"uncaughtException"}
   /app/src/index.js:11
   throw err;
   ^

   Error: missing env vars: no authorization configuration found
       at Object.<anonymous> (/app/src/auth/index.js:11:9)
       at Module._compile (node:internal/modules/cjs/loader:1101:14)
       at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
       at Module.load (node:internal/modules/cjs/loader:981:32)
       at Function.Module._load (node:internal/modules/cjs/loader:822:12)
       at Module.require (node:internal/modules/cjs/loader:1005:19)
       at require (node:internal/modules/cjs/helpers:102:18)
       at Object.<anonymous> (/app/src/app.js:14:23)
       at Module._compile (node:internal/modules/cjs/loader:1101:14)
       at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
   ```

   That didn't work. Our server started, but immediately crashed, stopping the container. Luckily we have a log message, which includes an error we can read (NOTE: often a container will crash on startup if not configured properly, so it's wise to start it without `-d` at first, until you know it works).

   Here, our error indicates that we are missing **environment variables** that are necessary to configure our authentication middleware. Since we already have these defined in an `.env` file, let's pass that file to the container with our `docker run` command using the [`--env-file` flag](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file):

   ```sh
   $ docker run --rm --name fragments-{your-github-username} --env-file .env fragments:latest

   > fragments@0.0.1 start
   > node src/index.js

   {"level":30,"time":1644604229095,"pid":21,"hostname":"457b740c0ebc","port":8080,"msg":"Server started"}
   {"level":30,"time":1644604229315,"pid":21,"hostname":"457b740c0ebc","msg":"Cognito JWKS cached"}
   ```

## Publishing Ports

1. Try connecting to your container's server using `curl`:

   ```sh
   $ curl localhost:8080
   curl: (7) Failed to connect to localhost port 8080: Connection refused
   ```

   That didn't work. Our server is running on port `8080`, but port `8080` **inside** a container, not port `8080` on our host machine. We need to connect port `8080` on our host machine to the container's port `8080`. Stop your container (`CTRL+c`), and let's run it again:

   ```sh
   $ docker run --rm --name fragments-{your-github-username} --env-file .env -p 8080:8080 fragments:latest

   > fragments@0.0.1 start
   > node src/index.js

   {"level":30,"time":1644604490297,"pid":21,"hostname":"5514934d0bb8","port":8080,"msg":"Server started"}
   {"level":30,"time":1644604490456,"pid":21,"hostname":"5514934d0bb8","msg":"Cognito JWKS cached"}
   ```

   The `-p 8080:8080` means `8080` on the host (left-hand) and `8080` in the container (right-hand). If you wanted to bind port `8080` in the container to port `5000` in the host, you'd do `-p 5000:8080` (try doing that, to prove to yourself how it works).

   Test your server again running on `8080:8080`:

   ```sh
   $ curl localhost:8080
   {"status":"ok","author":"David Humphrey <david.humphrey@senecapolytechnic.ca>","githubUrl":"https://github.com/humphd/fragments","version":"0.0.1"}
   ```

   And look at the logs for your server running in the container:

   ```js
   {"level":30,"time":1644604496131,"pid":21,"hostname":"5514934d0bb8","req":{"id":1,"method":"GET","url":"/","query":{},"params":{},"headers":{"host":"localhost:8080","user-agent":"curl/7.77.0","accept":"*/*"},"remoteAddress":"::ffff:172.17.0.1","remotePort":58966},"res":{"statusCode":200,"headers":{"content-security-policy":"default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests","cross-origin-embedder-policy":"require-corp","cross-origin-opener-policy":"same-origin","cross-origin-resource-policy":"same-origin","x-dns-prefetch-control":"off","expect-ct":"max-age=0","x-frame-options":"SAMEORIGIN","strict-transport-security":"max-age=15552000; includeSubDomains","x-download-options":"noopen","x-content-type-options":"nosniff","origin-agent-cluster":"?1","x-permitted-cross-domain-policies":"none","referrer-policy":"no-referrer","x-xss-protection":"0","access-control-allow-origin":"*","cache-control":"no-cache","content-type":"application/json; charset=utf-8","content-length":"143","etag":"W/\"8f-9PP22nRhkhADpztaqiYdiAsczRM\"","vary":"Accept-Encoding"}},"responseTime":6,"msg":"request completed"}
   ```

## Including configuration files

1. Now everything is working. Let's do it one more time, but use our **Basic Auth** config instead of the **AWS Cognito** config we have in `.env`. Let's switch our `--env-file` to use our `env.jest` file, instead of our `.env` file (or copy your `.env` file to `env.basic-auth` and modify the variables).

   ```sh
   docker run --rm --name fragments-{your-github-username} --env-file env.jest -p 8080:8080 fragments:latest

   > fragments@0.0.1 start
   > node src/index.js

   /app/src/index.js:11
   throw err;
   ^

   Error: ENOENT: no such file or directory, open 'tests/.htpasswd'
       at Object.openSync (node:fs:585:3)
       at Object.readFileSync (node:fs:453:35)
       at Basic.loadUsers (/app/node_modules/http-auth/src/auth/base.js:149:8)
       at new Base (/app/node_modules/http-auth/src/auth/base.js:43:12)
       at new Basic (/app/node_modules/http-auth/src/auth/basic.js:28:5)
       at module.exports (/app/node_modules/http-auth/src/auth/basic.js:118:10)
       at Object.basic (/app/node_modules/http-auth/src/http-auth.js:6:35)
       at Object.module.exports.strategy (/app/src/auth/basic-auth.js:18:10)
       at Object.<anonymous> (/app/src/app.js:32:28)
       at Module._compile (node:internal/modules/cjs/loader:1101:14) {
   errno: -2,
   syscall: 'open',
   code: 'ENOENT',
   path: 'tests/.htpasswd'
   }
   ```

   Our server (and container) crash right away: the **HTPASSWD** file we're referencing in our environment variables can't be found at `tests/.htpasswd`. The file is in our project, but we didn't include this file in our build context or copy it into our image, so the container can't locate it. Let's add a line to our `Dockerfile` to do that:

   ```dockerfile
   # Copy src/
   COPY ./src ./src

   # Copy our HTPASSWD file
   COPY ./tests/.htpasswd ./tests/.htpasswd

   # Run the server
   CMD npm start
   ```

2. Now re-build the image, overwriting the `latest` tag:

   ```sh
   docker build -t fragments:latest .

   [+] Building 0.9s (11/11) FINISHED
   => [internal] load build definition from Dockerfile                                             0.2s
   => => transferring dockerfile: 866B                                                             0.2s
   => [internal] load .dockerignore                                                                0.1s
   => => transferring context: 34B                                                                 0.1s
   => [internal] load metadata for docker.io/library/node:18.13.                                  0.6s
   => [auth] library/node:pull token for registry-1.docker.io                                      0.0s
   => [1/6] FROM docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6f  0.0s
   => => resolve docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6f  0.0s
   => [internal] load build context                                                                0.0s
   => => transferring context: 1.19kB                                                              0.0s
   => CACHED [2/6] WORKDIR /app                                                                    0.0s
   => CACHED [3/6] COPY package*.json .                                                            0.0s
   => CACHED [4/6] RUN npm install                                                                 0.0s
   => CACHED [5/6] COPY ./src ./src                                                                0.0s
   => ERROR [6/6] COPY ./tests/.htpasswd ./tests/.htpasswd                                         0.0s
   ------
   > [6/6] COPY ./tests/.htpasswd ./tests/.htpasswd:
   ------
   error: failed to solve: failed to compute cache key: "/tests/.htpasswd" not found: not found
   ```

   Notice that almost every layer is `CACHED` already (we don't need to re-build layers that haven't changed). However, our new layer (i.e., layer 6) is failing. It can't locate `/tests/.htpasswd`.

   This is happening because we told Docker not to include `tests/` in the build context (see `.dockerignore`). Docker looks in the **build context** not in our actual directory, so we have to make sure we send the right files and directories in the build context. We didn't think we needed any of these test files, but now we've changed our mind about 1 of the files. Let's add an exception for this one file to our `.dockerignore`:

   ```dockerignore
   tests/
   !tests/.htpasswd
   ```

   With the `!` prefix, we can un-ignore this individual path inside `tests/`, which is being ignored otherwise.

3. Try your build again:

   ```sh
   $ docker build -t fragments:latest .

   [+] Building 0.5s (11/11) FINISHED
   => [internal] load build definition from Dockerfile                                             0.1s
   => => transferring dockerfile: 32B                                                              0.1s
   => [internal] load .dockerignore                                                                0.1s
   => => transferring context: 161B                                                                0.1s
   => [internal] load metadata for docker.io/library/node:18.13.0                                  0.3s
   => [1/6] FROM docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6f  0.0s
   => => resolve docker.io/library/node:18.13.0@sha256:2033f4cc18f9d8b5d0baa7f276aaeffd202e1a2c6f  0.0s
   => [internal] load build context                                                                0.1s
   => => transferring context: 1.41kB                                                              0.1s
   => CACHED [2/6] WORKDIR /app                                                                    0.0s
   => CACHED [3/6] COPY package*.json .                                                            0.0s
   => CACHED [4/6] RUN npm install                                                                 0.0s
   => CACHED [5/6] COPY ./src ./src                                                                0.0s
   => [6/6] COPY ./tests/.htpasswd ./tests/.htpasswd                                               0.0s
   => exporting to image                                                                           0.0s
   => => exporting layers                                                                          0.0s
   => => writing image sha256:ab6eb9bf392843c38c07800f3dddcf0f008c2e71f59f66e3dcb0a0ae24ae11bb     0.0s
   => => naming to docker.io/library/fragments:latest                                              0.0s
   ```

   This worked.

4. Try running it again:

   ```sh
   docker run --rm --name fragments-{your-github-username} --env-file env.jest -p 8080:8080 fragments:latest
   fragments@0.0.1 start
   node src/index.js
   ```

   Using `curl localhost:8080` shows our server is working, but we see no logs because the `env.jest` file sets `FRAGMENTS_LOG_LEVEL=silent`.

5. Let's override that single environment variable. Stop your container and run a new one like this:

   ```sh
   docker run --rm --name fragments-{your-github-username} --env-file env.jest -e FRAGMENTS_LOG_LEVEL=debug -p 8080:8080 fragments:latest

   fragments@0.0.1 start
   node src/index.js

   [1644606018980] INFO (20 on 9d6770ad31ab): Server started
       port: 8080
   ```

   This worked. Stop your container and we'll make one more change.

## Detaching a Container

1. Now that we know things are working, let's run our container in the background (i.e., as a daemon, detached from a terminal). To do that, we'll use the `-d` flag:

   ```sh
   $ docker run --rm --name fragments-{your-github-username} --env-file env.jest -e FRAGMENTS_LOG_LEVEL=debug -p 8080:8080 -d fragments:latest
   3e1e6f1b9f86c30dc52115eb668a5cee34887f877271481e06b006e98ae761f3
   ```

Docker runs our container, and prints its `id`. We can use this `id` to manage and interact with it later. For example, to see its logs:

```sh
docker logs 3e1e6f1b9f86c30dc52115eb668a5cee34887f877271481e06b006e98ae761f3

> fragments@0.0.1 start
> node src/index.js

[1644606147262] INFO (21 on 3e1e6f1b9f86): Server started
    port: 8080
```

1. We can also have Docker **follow** the logs (i.e., keep printing them as they happen) with the `-f` flag:

   ```sh
   docker logs -f 3e1e6f1b9f86c30dc52115eb668a5cee34887f877271481e06b006e98ae761f3

   > fragments@0.0.1 start
   > node src/index.js

   [1644606147262] INFO (21 on 3e1e6f1b9f86): Server started
       port: 8080
   ```

   Try using `curl` or your browser to hit your server's health check route, and make sure you see the logs get printed.

2. Add and commit your `Dockerfile` and `.dockerignore` files to git

## Docker on EC2

1. Let's try to recreate this same setup on an EC2 instance. Using what you learned in [Lab 4](../lab-04/README.md), start or create and start a new EC2 instance.

2. Once your EC2 instance is started, connect to it using `ssh` or PuTTY and the SSH key pair you created in a previous lab.

3. Follow the [AWS EC2 Docker instructions to install `docker`](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html#install-docker-instructions) on your EC2 instance. NOTE: since AWS updated the recommended Amazon Linux AMI from Amazon Linux 2 to Amazon Linux 2023, the command to install Docker has also changed. If the AWS documentation in the link above is not yet updated (it was not at the time of writing), you can use the following command on Amazon Linux 2023 to install Docker: `sudo yum install -y docker`.

4. Like you did in [Lab 4](../lab-04/README.md), create a new tarball of your project using `npm pack` and use `scp` to copy this file to your EC2 instance. You can delete any existing tarballs that might already be there.

5. Extract and expand your tarball on the EC2 instance, creating a `package/` directory with all of your code, including your `Dockerfile` and `.dockerignore` files. Make sure you can see these files.

6. Build a Docker image on your EC2 instance using what you learned above working on your local machine. The steps should be nearly identical.

7. Run a new container on your EC2 instance based on your image, like you did in step 21 above. Make a note of the container's `id`.

8. Open a new terminal on your local machine and confirm that you can connect to the server running in the Docker container on your EC2 instance.

9. Inspect the logs for your server on the EC2 instance using `docker logs` with the `id` of the running container.

10. Use `docker ps` to see a list of all Docker processes running. You should see your running container.

11. When you are finished testing and getting the screenshots you need for submission, stop the container on your EC2 instance using `docker kill <id>`, with the `id` of your container. Try to use `curl` to connect with it again, and confirm that it is no longer running.

12. Use `docker ps` to confirm that your container is no longer running.

## Submission

1. Links to your `fragments` microservice's `Dockerfile` and `.dockerignore` files on GitHub.
2. Screenshots of your `fragments` microservice running as a Docker container in **detached** mode. Use port `5555` on your host and port `8080` in the container. Use `curl` or your browser to hit the server's health check route inside the container, and `docker logs` to show the server's logs when you do.
3. Screenshot of your `fragments` microservice container running in Visual Studio Code via the Docker Extension. Right-click it and include the logs.
4. Screenshots of your `fragments` microservice running as a Docker container in **detached** mode on EC2. Use port `8080` on your EC2 host and port `8080` in the container. Use `curl` or your browser to hit the EC2 server's health check route inside the container, and `docker logs` on the EC2 instance to show the server's logs when you do.
5. Screenshot showing that you have stopped your EC2 instance, now that the lab is complete.
6. Screenshot of your current account costs in the AWS Console
