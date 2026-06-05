# Topic Demos and Discussions

## `npm install` vs. `npm ci`

- [`npm install`](https://docs.npmjs.com/cli/v8/commands/npm-install)
- [`npm ci`](https://docs.npmjs.com/cli/v8/commands/npm-ci) for installing a project with a "clean slate" (e.g., in CI/production)
  - [package-lock.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json)
  - Uses dependencies and versions defined in `package-lock.json` vs. `package.json`
  - Removes an existing `node_modules/` folder if present
  - Fails if `package-lock.json` is out of sync with `package.json`
  - Lock file is **generated**. Never hand-edit it. Check into git.
  - Use `npm ci` in CI vs. `npm i`
  - npm [`install-ci-test`](https://docs.npmjs.com/cli/v8/commands/npm-install-ci-test)

## Git Commands

Make sure you're comfortable using all of the following git commands:

- `add` - add files, directories to the **staging area** (e.g., _stage_ a commit)
- `rm` - remove files, directories from the **staging area**, **working dir**
- `mv` - move/rename files, directories from the **staging area**, **working dir**
- `status` - get information about the status of the **working dir**, **staging area** compared to the most recent commit (`HEAD`)
- `commit` - create a new commit from the changes in the **staging area** compared to the most recent commit (`HEAD`)
- `log` - view the history of previous commits
- `push` - share commits in the local repository with a remote repository

There are many more advanced features of git, but we won't be using them in this course.

## GitHub Push Protection

When working with git and cloud computing, we often have to deal with various kinds of secrets. For example, in our `.env` files, using API keys, certificates, etc. As we've said, it's important to be extremely careful about **not** adding any secrets to git.

In order to help developers avoid this mistake, GitHub has [added support](https://github.blog/2023-05-09-push-protection-is-generally-available-and-free-for-all-public-repositories/) to all repositories for [push protection](https://docs.github.com/en/enterprise-cloud@latest/admin/code-security/managing-github-advanced-security-for-your-enterprise/managing-github-advanced-security-features-for-your-enterprise#managing-advanced-security-features).

With push protection enabled for a repository, GitHub will scan commits _before_ they are added to a public repository and allow the developer to make adjustments.

See [the docs](https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/protecting-pushes-with-secret-scanning) for more info about how they work. You should consider enabling this for your own repos.

## YAML and GitHub Actions Syntax

- Comments start with `# ...`

```yml
# This is a comment
```

- We define key/value pairs

```yml
on: push
```

- We nest using 2-space indents:

```yml
on:
  push:
    branches: main
```

- String values _may_ be quoted, but don't have to be

```yml
steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-node@v6
    with:
      node-version: '20'
      # or we could write it like this (no quotes):
      node-version: 20.x
```

- String values can be written over multiple lines using a `literal block`:

```yml
run: |
  npm ci
  npm run build
```

- Sequences use the `-` character and can be nested

```yml
on:
  pull_request:
    branches:
      - main
      - 'mona/octocat'
      - 'releases/**'
```

- You can also use JSON-style notation

```yml
job3:
  needs: [job1, job2]
```

## Jest, Supertest

- `jest.config.js`
  - reading an `env` file
  - overriding environment variables (NOTE: we can enable/disable logging)
  - setting `timeout` and other configuration options
- Jest and ESLint (`env`: `jest`)
- Running tests in regular, watch, or coverage modes
  - Writing `npm scripts`
  - Running a single test
- `expect()` and [Jest's Matchers](https://jestjs.io/docs/expect)
  - `expect(a).toBe(b)` - referential identity (like doing `===`)
  - `expect(a).toEqual(b)` - "deep" equal (recursive compare)
  - `expect(a).not.toEqual(b)` - negate the match. Works with any matcher
  - `expect(a).toBeGreaterThan(b)` - `a > b`
  - `expect(a).toBeGreaterThanOrEqual(b)` - `a >= b`
  - `expect(() => f()).toThrow()` - `f()` should `throw`
  - `expect(getItems()).toContain('item')` - `getItems()` should return Array containing `item`
  - `expect(a).toMatch(/regex/)` - `a` should match a `regex`
  - etc.

- [supertest](https://www.npmjs.com/package/supertest) and [superagent](https://github.com/visionmedia/superagent)
  - `request(app)` - let supertest create an instance of your `app` object (no ports, server, etc)
  - `const response = await request(app).get('/foo');` - use an HTTP verb (`get`, `post`, etc.) and give a route's path
  - `request(app).get('/foo').auth(username, password)` - pass `Authorization` headers with Basic Auth credentials
  - `request(app).get('/foo').set('Content-Type', 'text/plain')` - set an HTTP header, or use `.type(...)`
  - `request(app).post('/foo').type('text/plain').send(data)` - post `data` with a `Content-Type` of `text/plain`
  - `const response = await request(app).get('/foo');` - access `response` values `response.body`, `response.headers`, `response.status`

## HTTP Basic Auth

We're going to use HTTP Basic Auth in development and testing in order to simplify things. The idea behind HTTP Basic Auth is that user credentials (username and password) are encrypted and stored in a file named `.htpasswd`. This approach does not scale, but is perfect for local development and testing.

Many students find it confusing to have two different authentication strategies implemented, but only one in use at runtime. We will use environment variables to configure which strategy to use (i.e., HTTP Basic Auth or Amazon Cognito).

It's important that you learn how to deal with the two providers, when to use them, how to configure each, etc.

- [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)
- [`Authorization` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#basic_authentication)
- [`.htpasswd` file](https://httpd.apache.org/docs/2.4/programs/htpasswd.html)
- [htpasswd node module](https://github.com/gevorg/htpasswd)

  ```sh
  npx htpasswd -cbB tests/.htpasswd user1@email.com password1
  npx htpasswd -bB tests/.htpasswd user2@email.com password2
  ```

- [http-auth](https://www.npmjs.com/package/http-auth)
- [http-auth-passport](https://www.npmjs.com/package/http-auth-passport)
