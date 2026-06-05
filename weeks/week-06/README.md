# Week 6

## Lectures

1. [Dockerfiles](./dockerfiles.md)
1. [Dockerfiles for fragments-ui](./dockerize-web-app.md)

## Readings and References

- [Install Docker](https://docs.docker.com/get-docker/).
- [Install the Docker Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- Using [`docker init`](https://docs.docker.com/engine/reference/commandline/init/) to [initialize Dockerfiles](https://www.docker.com/blog/docker-init-initialize-dockerfiles-and-compose-files-with-a-single-cli-command/)
- [Docker on Amazon EC2](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html#install-docker-instructions)
- [Explain Shell](https://explainshell.com/) - amazing for helping you understand various shell commands you encounter in Dockerfiles.
- Sample Dockerfiles
  - [fragments-ui with parcel serve](./Dockerfile.parcel)
  - [fragments-ui with nginx](Dockerfile.nginx)

## TODO

- Complete [Lab 5](../../labs/lab-05/README.md)
- Work on new requirements for Assignment 2:
  - 4.4 `GET /fragments` supporting both with `?expand=1` and without, with tests
  - 4.7 `GET /:id/info` with tests
