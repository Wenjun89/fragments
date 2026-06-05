# Passport Authentication with JWT Tokens

## Lecture

<https://www.youtube.com/watch?v=h8te5AmRZcc>

## Introduction

This week we will explore Passport for handling authorization checks in our microservices. We will be using Passport to work with JWTs (JSON Web Tokens) that we receive from Amazon Cognito. The goal is to understand the code thoroughly rather than simply copying and pasting it into your project.

**Important Philosophy**: You are responsible for every line of code you add to your program. You need to understand what it does, why it does it, and be able to modify it as needed.

## Why Passport?

There are different modules available for handling authorization in REST APIs. We are using Passport because:

- It integrates well with Express (which you have already worked with)
- It is the logical choice when using Express
- It provides a flexible, middleware-based approach to authentication

## How Passport Works

Passport functions as a series of hooks or middleware functions that integrate into Express's middleware chain. Here's how the process works:

1. A request comes in and gets handled by one or more functions
2. The request passes through middleware on its way to being terminated by a route or error handler
3. We insert an authorization function (Passport middleware) into this chain
4. Passport checks headers, body, query parameters, or other defined locations for authentication information
5. If the information matches our expectations, Passport extracts a user object
6. The user object gets added to the request and passed to the next element in the chain

## The Strategy Pattern

Passport uses the strategy pattern, which allows us to vary the authentication algorithm by swapping out different implementations while maintaining the same interface. There are over 537 strategies available, including:

- Google authentication
- Facebook authentication
- Auth0
- Generic OAuth providers
- Bearer tokens (which we will use)

For our implementation, we will use a bearer token strategy with AWS code for verification and validation using cryptographic signatures.

## HTTP Basic Authentication

We will also use HTTP basic authentication in future weeks for unit testing. Basic authentication uses a file of usernames and hashed passwords stored on the server. This approach eliminates the complexities of browser-based OAuth with Cognito during automated testing, avoiding the multiple redirects that occur during the login process.

## Implementation Details

### Required Modules

```javascript
const passport = require('passport');
const { Strategy: BearerStrategy } = require('passport-http-bearer');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
```

### Setting Up the JWT Verifier

First, we configure the Cognito JWT Verifier:

```javascript
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.CLIENT_ID,
});
```

This configuration requires:

- **User Pool ID**: Identifies your Cognito user pool
- **Token Use**: Specifies we want to verify ID tokens (not access tokens)
- **Client ID**: Identifies your specific application client

### Hydrating the Verifier

```javascript
await jwtVerifier.hydrate();
```

The hydrate process downloads the JSON Web Key Set (JWKS) from Amazon. This key set contains the public keys used to verify token signatures. The URL format is:

```txt
https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
```

The JWKS contains an array of public keys with information about:

- The algorithm used for signing
- The key type
- The actual public key data

While hydration is optional (keys can be downloaded on first use), it's recommended to avoid delays during the first authentication attempt.

### Creating the Bearer Strategy

```javascript
const bearerStrategy = new BearerStrategy(async (token, done) => {
  try {
    const user = await jwtVerifier.verify(token);
    const userInfo = { email: user.email };
    console.log('User authenticated:', userInfo);
    return done(null, userInfo);
  } catch (error) {
    console.error('Token verification failed:', error);
    return done(null, false);
  }
});
```

The bearer strategy:

1. Extracts the bearer token from the Authorization header
2. Calls our verification callback with the token
3. Our callback verifies the token using the JWT verifier
4. If successful, we extract user information (email) and pass it to the done callback
5. If verification fails, we return false to indicate authentication failure

### Authentication Middleware

```javascript
const authenticate = passport.authenticate('bearer', { session: false });
```

This creates middleware that:

- Uses the bearer strategy
- Disables session storage (we validate tokens on every request)
- Can be inserted into any route that requires authentication

### Integration with Express

```javascript
app.use(passport.initialize());
passport.use('bearer', bearerStrategy);

// Protected route example
app.get('/protected-endpoint', authenticate, (req, res) => {
  // req.user contains the authenticated user information
  res.json({ message: 'Access granted', user: req.user });
});
```

## Making Authenticated Requests

When calling secured endpoints, you must include the bearer token in the Authorization header:

```javascript
const headers = {
  Authorization: `Bearer ${idToken}`,
  'Content-Type': 'application/json',
};

const response = await fetch('/api/protected-endpoint', {
  method: 'GET',
  headers: headers,
});
```

## Code Organization Best Practices

### Small, Focused Files

Break your code into smaller, more manageable files:

- Separate route handlers into individual files
- Create dedicated modules for specific functionality
- Use many small files instead of one large file

### Benefits of Modular Organization

1. **Easier Testing**: Individual modules can be imported and tested as units
2. **Better Maintainability**: Smaller files are easier to understand and modify
3. **Improved Reusability**: Modules can be reused across different parts of your application

### Using index.js Files

When you name a file `index.js`, Node.js will automatically resolve it when requiring the directory:

```javascript
// These are equivalent:
require('./routes/index.js');
require('./routes');
```

This pattern makes your imports cleaner and establishes clear entry points for your modules.

## Flexibility and Customization

While the provided code structure serves as a starting guide, you have flexibility to:

- Reorganize files and folders
- Rename components
- Use different modules or syntax
- Implement in TypeScript instead of JavaScript

**Important Note**: Support will be primarily available for the provided implementation. If you deviate significantly from the suggested approach, you may need to troubleshoot independently.

## Testing Mindset

As you write code, always ask yourself: "How will I test this?" This mindset encourages:

- Writing smaller, testable functions
- Creating modular, importable components
- Designing code that can be easily isolated for unit testing

In upcoming weeks, testing will become a central focus, so developing this mindset early will be beneficial for your development process.
