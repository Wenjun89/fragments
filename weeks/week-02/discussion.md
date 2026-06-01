# Topic Demos and Discussions

## Environment Variables

- Values that affect a process when it runs
- [Twelve-Factor App: Config](https://12factor.net/config)
- Useful for global, user-defined values (e.g., `HOME` directory), configuration values that can be changed (e.g., server `PORT` number) or passing sensitive data into programs without storing them in source code (e.g., passwords in a database `CONNECTION_STRING`)
- Examples
  - `PATH` - colon-separated list of directories to use when searching for a file
  - `HOME` - the current user's home directory
  - `PWD` - the current working directory
- Usually local to a particular shell/process (e.g., different shells/terminals will have different environments)
- Set an environment variable:
  - `export VARIABLE=value` (define the variable in the current environment for all processes started within it)
  - `VARIABLE=value node server.js` (prefix syntax is used to define the variable only for this particular process)
- Clear an environment variable:
  - `unset VARIABLE`
- Inspect the value of an environment variable (NOTE the `$` prefix):
  - `echo $HOME` - show the user's home directory
  - `env` - print all environment variables
- `.env` file defines multiple environment variables, and groups them together:

  - Blank lines are ignored
  - Lines starting with `#` are considered comments
  - Variables are defined in `VAR=val` format
  - Variables are usually written in UPPERCASE
  - Be careful with whitespace and quotes, which will become part of a value
    - `VAR="abc"` means `VAR` is `"abc"` (including quotes)
    - `VAR= abc` means `VAR` is `abc` (including leading/trailing spaces)
  - Example:

  ```ini
  # This is a comment
  VARIABLE=value

  ANOTHER_VARIABLE="another value"

  # This variable is commented out (not set)
  #THIRD_VARIABLE=third value
  ```

- [dotenv](https://www.npmjs.com/package/dotenv) to load an `.env` into the [`process.env` node Object](https://nodejs.org/api/process.html#processenv):

  - `require('dotenv').config();` loads the `.env` in the current directory (project root). You only need to do this once in your program (e.g., in your `index.js` entry file on startup)
  - `process.env.VARIABLE` lets you access the value of the `VARIABLE` environment variable from the current process' environment
  - It's common to check for a variable and error if it's missing:
    - `if(!process.env.VARIABLE) throw new Error('missing VARIABLE');`
  - It's also common to provide default values, but allow overriding:
    - `const port = process.env.PORT || 8080;`

- NOTE: especially for **Windows users**, you can also use [cross-env](https://www.npmjs.com/package/cross-env) and/or [env-cmd](https://www.npmjs.com/package/env-cmd) to help you automatically load environment variables from npm scripts cross-platform.

- Never put your `.env` file(s) in git. Add `.env` to your [`.gitignore`](https://www.atlassian.com/git/tutorials/saving-changes/gitignore):

  ```ini
  # Ignore entire node_modules folder
  node_modules/

  # Ignore .env file
  .env

  # Or, ignore files ending in .env
  *.env

  # But perhaps allow a specific test.env file, which we use in testing
  !test.env
  ```

- Make things configurable that might change so you don't have to hand-edit source code to modify how your program runs (e.g., URLs)

## Passport.js Authentication and Authorization

- [Passport.js](https://www.passportjs.org/) is middleware for handling user authentication (who you are) and authorization (what you're allowed to do)
- You define one or more [Strategies](https://www.passportjs.org/packages/), which do the work of authenticating/authorizing the request. For example:
  - Bearer Token
  - HTTP Basic Auth
  - GitHub/Google/Facebook OAuth
- Servers define a `verify` callback to figure out what to do with user info (e.g., token, username, etc.) once authenticated:

  ```js
  new BearerStrategy(async (token, done) => {
    try {
      // Verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');

      // Create a user, but only bother with their email
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });
  ```

- Routes use Passport authentication middleware to decide if a request is allowed to happen.
  - `router.get('/fragments', passport.authenticate('bearer', { session: false }), (req, res) => {...})`
    - If `authenticate()` fails, an HTTP `401 Unauthorized` is returned
    - If `authenticate()` passes, user info is attached to `req.user` and the next middleware function is called (i.e. your route)

## Code Organization

- Prefer more, smaller files to large ones. Break your code up into smaller units. Easier to understand, reuse, and test smaller units of code.
- Build a "how will I test this?" mindset. Start thinking about writing smaller units of code (sets of functions, classes, modules) vs. entire programs.
- Prefer deeper directory structures with useful sub-folder names
- Use `index.js` as an entry point for an entire sub-folder, so it's easy to `require()` or `import` the parent folder name.

  ```text
  fragments/
  ├─ package.json
  ├─ node_modules/
  ├─ src/
  │  ├─ routes/
  │  │  ├─ index.js
  │  │  ├─ api/
  |  │  │  ├─ index.js
  |  │  │  ├─ get.js
  │  ├─ index.js
  │  ├─ server.js
  │  ├─ app.js
  │  ├─ logger.js
  ├─ ...
  ```
