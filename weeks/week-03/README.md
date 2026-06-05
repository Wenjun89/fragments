# Week 3

## Lectures

1. [Intro to git, GitHub, and Continuous Integration (CI) with GitHub Actions](./git-and-ci.md)
2. [Unit Testing](./unit-testing.md)
3. [Discussion of npm, git, YAML, GitHub Actions, Jest, Supertest, and HTTP Basic Auth for Lab 3](./npm-yaml-testing-auth.md)

## Readings and References

- [GitHub Actions](https://docs.github.com/en/actions)
  - Official [GitHub Actions VSCode extension](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)
  - [Understanding GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)
  - [Continuous Integration](https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration)
  - [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
    - [YAML](https://en.wikipedia.org/wiki/YAML), [Learn the basics of YAML in a few minutes](https://learnxinyminutes.com/docs/yaml/)
- Unit Testing: we'll use one of Jest or Vitest (both do the same thing)
  - [Jest](https://jestjs.io/)
    - [Installing Jest](https://jestjs.io/docs/getting-started)
    - [Configuring Jest](https://jestjs.io/docs/configuration)
    - [`expect()` Jest Matchers](https://jestjs.io/docs/expect)
  - [Vitest](https://vitest.dev/)
    - [Installing Vitest](https://vitest.dev/guide/)
    - [Configuring Vitest](https://vitest.dev/config/)
    - [`expect()` Vitest Assertions](https://vitest.dev/api/expect.html)
  - [Supertest](https://www.npmjs.com/package/supertest)
  - [Superagent](https://github.com/visionmedia/superagent)
- [Best practices for handling node.js errors](https://blog.heroku.com/best-practices-nodejs-errors)
- [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)
  - [`.htpasswd` file](https://httpd.apache.org/docs/2.4/programs/htpasswd.html)
  - [htpasswd node module](https://github.com/gevorg/htpasswd)
  - [http-auth](https://www.npmjs.com/package/http-auth) and [http-auth-passport](https://www.npmjs.com/package/http-auth-passport) for Passport.js
- [Topic Demos and Discussions](discussion.md)

## TODO

- Complete [Lab 3](../../labs/lab-03/README.md). This lab will take you most of the week, so begin early. The readings above are background to help you with the lab.
- Use the course GitHub Discussions to get help with your lab
- Start thinking about implementing bits of [Assignment 1](../../assignments/assignment-01/README.md)
