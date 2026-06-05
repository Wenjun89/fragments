# Topic Demos and Discussions

## docker cli

- On Windows and macOS, you need to start Docker Engine _before_ you can use the `docker` command:

  ```sh
  $ docker run humphd/hello-docker
  docker: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?.
  See 'docker run --help'.
  ```

- Start the **Docker Desktop** app to run Docker Engine
- `docker` to see all commands
- `docker run --help` to see help docs for the `run` sub-command
- `docker run -i -t --name test ubuntu`

  ```sh
  $ docker run -i -t --name test ubuntu
  Unable to find image 'ubuntu:latest' locally
  latest: Pulling from library/ubuntu
  bbf2fb66fa6e: Pull complete
  Digest: sha256:669e010b58baf5beb2836b253c1fd5768333f0d1dbcb834f7c07a4dc93f474be
  Status: Downloaded newer image for ubuntu:latest
  root@5285161e5aae:/#
  ```

  - `-i` style flags often have have a longer version, `-i, --interactive`. Use either/or, but be aware of both styles, since scripts will often use shorter versions
  - You can combine multiple flags into one: `-i -t` or `-it`
  - Some flags expect values: `--name test` or `--name="test"` both are common, but using `"..."` allows you to include spaces or other things that would be interpreted as part of the command. Other flags expect a boolean or number `--rm==false`, `--cpus=2`

### [docker run](https://docs.docker.com/engine/reference/commandline/run/)

- Run a command (or the default `CMD`) in a new container:
- `docker run [OPTIONS] image [COMMAND] [ARG...]`

- `docker run ubuntu echo "hello from within Ubuntu"`
  - Create a new container based on the `ubuntu` image, `pull` it if we don't have it locally
  - Start the new container
  - Run the `echo` command and pass it `"hello from within Ubuntu"` as an argument
- Try running that again, notice that it doesn't have to download anything and starts instantly

- `docker run --name testing-ubuntu ubuntu`
  - Create a new container based on the `ubuntu` image
  - Start the new container, and give it a name `testing-ubuntu`
  - Notice that nothing happens (i.e., it exits immediately)
- Try running that again, notice it won't allow us to create another container with the same name

- `docker run -it ubuntu bash`

  - Create a new container based on the `ubuntu` image
  - Start the new container in interactive mode with a terminal (tty)
  - Run `bash` (shell)
  - We are now inside the container, have a look around (`ps`, `ls`, `top`, etc) and `exit` to leave

- `docker run --rm -it ubuntu bash`

  - Create a new container based on the `ubuntu` image
  - Start the new container in interactive mode with a terminal (tty), and remove it (`rm)` when it exits. NOTE: our previous containers based on the `ubuntu` image still exist.
  - Run `bash` (shell)

- `docker run --rm httpd`

  - Create a new container based on the `httpd` image ([Apache Web Server](https://httpd.apache.org/)), `pull` it if we don't have it locally
  - Start the new container
  - Notice that it doesn't exit. This is a server running in the foreground (i.e., logs are printed to `stdout`)
  - Exit with `CTRL+c`, which shuts down the server

- `docker run --rm -d httpd`

  - Create a new container based on the `httpd` image
  - Start the new container in the background (`daemon` mode)
  - Docker prints the container's `id` (e.g., something like `9b035c0ff048ef3e407bc3ed1d1e816fdcb468d24c6d2ed79c7922271300ec48`)
  - `docker ps` to see the running container(s)
  - `docker logs 9b035c0ff048ef3e407bc3ed1d1e816fdcb468d24c6d2ed79c7922271300ec48` to see the logs from the running container. Use `-f` to follow the logs as they happen.
  - Exit with `CTRL+c`, which shuts down the server

- `docker run --rm -p 8000:80 httpd`

  - Create a new container based on the `httpd` image
  - Start the new container in the foreground (so we can see the logs)
  - Publish a port inside the container (`80`) to the host (`8000`). The order is always `host:container`
  - Visit <http://localhost:8000>, which will connect you to the Apache server running on port `80` inside the container (examine the logs when you do, you should see your request get logged).
  - Exit with `CTRL+c`

- `docker run --rm -p 8000:80 -d httpd`

  - Create a new container based on the `httpd` image
  - Start the new container in the background (daemon). NOTE its `id`
  - Publish a port inside the container (`80`) to the host (`8000`)
  - Visit <http://localhost:8000>
  - `docker ps` to see this running container, look for the `id
  - `docker container kill fee41798229c` (use your `id` from above)

- `docker run --rm -p 8000:80 -d httpd`

  - Create a new container based on the `httpd` image
  - Start the new container in the background (daemon). NOTE its `id`
  - Publish a port inside the container (`80`) to the host (`8000`)
  - Visit <http://localhost:8000>
  - `docker exec -it fee41798229c bash` execute a command (`bash)` inside the running container (`fee41798229c`) and attach an interactive terminal
  - `cd /usr/local/apache2/htdocs`
  - `cat index.html`
  - `echo "<h1>I changed it</h1>" > test.html`
  - Visit <http://localhost:8000/test.html>
  - `docker container kill fee41798229c` (use your `id` from above)

- `docker run --rm -p 8000:80 -v "$PWD":/usr/local/apache2/htdocs/ -d httpd`
  - Create a new container based on the `httpd` image
  - Start the new container in the background (daemon). NOTE its `id`
  - Publish a port inside the container (`80`) to the host (`8000`)
  - Create a volume (`-v`) that overrides the contents of `/usr/local/apache2/htdocs/` with what's in the current working directory (`"$PWD"`). NOTE: on Windows in `cmd` you can use `%cd%` instead of `$PWD`, or use an absolute path.
  - Visit <http://localhost:8000>
  - `docker exec -it fee41798229c bash` execute a command (`bash)` inside the running container (`fee41798229c`) and attach an interactive terminal
  - `cd /usr/local/apache2/htdocs`
  - `cat index.html`
  - `echo "<h1>I changed it</h1>" > test.html`
  - Visit <http://localhost:8000/test.html>
  - `docker container kill fee41798229c` (use your `id` from above)

#### Other example images

- Operating Systems
  - [amazonlinux](https://hub.docker.com/_/amazonlinux)
  - [alpine](https://hub.docker.com/_/alpine)
- Programming Languages/Runtimes/Environments
  - [gcc](https://hub.docker.com/_/gcc) - `docker run --rm gcc gcc --version`
  - [node](https://hub.docker.com/_/node) - `docker run -it --rm node`
  - [python](https://hub.docker.com/_/python) - `docker run -it --rm python`
  - [VSCode Server](https://github.com/gitpod-io/openvscode-server) - `docker run --rm -it --init -p 3000:3000 -v "$(PWD):/home/workspace:cached" gitpod/openvscode-server`
  - [Jupyter Notebook](https://hub.docker.com/u/jupyter) - `docker run --rm -p 8888:8888 jupyter/base-notebook`
- Web Servers
  - [nginx](https://hub.docker.com/_/nginx)
  - [httpd](https://hub.docker.com/_/httpd)
  - [wordpress](https://hub.docker.com/_/wordpress)
  - [minecraft-server](https://hub.docker.com/r/minecraftservers/minecraft-server)
- Databases
  - [redis](https://hub.docker.com/_/redis)
  - [mysql](https://hub.docker.com/_/mysql)
  - [postgres](https://hub.docker.com/_/postgres)
  - [mongo](https://hub.docker.com/_/mongo)
- Command Line Tools
  - [amazon/aws-cli](https://hub.docker.com/r/amazon/aws-cli) - `docker run --rm -it amazon/aws-cli help`

### [docker container](https://docs.docker.com/engine/reference/commandline/container/)

- Manage containers
- `docker container [COMMAND]`
- `docker container ls` list all of the containers on the system, showing their `id`, `image`, `name`, etc
- `docker container start CONTAINER` (stop, restart)
- `docker container kill CONTAINER` - stops a running container
- `docker container cp` copy files/folders into or out of a container
  - `docker container cp testing-ubuntu:/tmp/data.txt .` copy `/tmp/data.txt` from within the container named `testing-ubuntu` to the current directory
  - `docker container cp ./data.txt testing-` copy `/tmp/data.txt` from within the container to the current directory

### [docker image](https://docs.docker.com/engine/reference/commandline/image/)

- Manage images
- `docker image [COMMAND]`
- `docker image ls` list all of the images on the system, showing their `id`, `size`, `repository`, `tag`
  - The `REPOSITORY` is where this image was pulled, or `<none>` if built locally
  - the `TAG` is a version name/number, used to identify different builds (e.g., `v1.2.3` vs. `v.1.2.4`). The tag `latest` is often used to indicate _"this is the latest build of this image"_, and it gets updated whenever a new build is pushed to the repository
- `docker image rm [IMAGE]` removes an image
- `docker image prune` removes all unused (i.e., dangling) images. `docker image prune -a` also removes any images not associated with a container

## Docker Desktop

- Examine Containers
  - Start
  - Stop
  - Restart
  - Delete
  - CLI
  - Click on Container to see Logs, Stats, Inspect details
- Examine Images
  - Name, Tag, Image ID, Created Size
  - In Use vs. Unused
  - "Clean up..." to remove Unused or Dangling images

## Docker VSCode Extension

- [Docker Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- Examine Images
  - `Run`
  - `Run Interactive`
- Examine Containers
  - `View Logs`
  - `Start`
  - `Stop`
  - `Restart`
  - `Attach Shell`
  - `Files`
- Right-click Dockerfile, `Build Image`
