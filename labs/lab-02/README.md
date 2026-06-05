# Lab 2

This lab covers some critically important concepts and technologies. It will get you started working with AWS and guide you through securing your `fragments` microservice. It will also show you how to create a simple web client, `fragments-ui`, for manual testing of your `fragments` microservice API.

This lab will take you some time to complete, so please give yourself lots of time to work on it. You don't need to finish it in a single sitting and are encouraged to break it up over a series of sessions. As you work, remember to use git to `add` and `commit` your changes (e.g., whenever you get something working, or make a significant change).

The cloud is big and complicated by the fact that you have to worry about security from day one. Everyone doing this lab is going to get stuck or run into problems. That's OK! Write down any questions or problems you encounter and bring them up in the course Discussions. I promise you won't be the only person who struggles with something.

Take your time. Don't give up if you get stuck. Ask questions. You can do this!

## AWS Accounts and CloudLabs

1. You will have received an email with an invitation to launch a CloudLabs instance. CloudLabs is how we create and manage student AWS accounts, and this is how you access AWS during the course. If you do not receive one, please contact your professor.

2. Launching the lab environment will take some time the first time you do it (e.g., 5 minutes). This is required to create and deploy a number of AWS resources for your account. Please be patient while it initializes everything.

3. When the lab is fully launched, you will be presented with various info about your account. First the **Sign-in Link** is the URL you should use to access AWS. You will require the included **Username** and **Password** to login. Once logged in, you will be taken to the [AWS Management Console](https://aws.amazon.com/console/faq-console/). Please record all of these URLs (CloudLabs, AWS Sign-In, etc) since you will use them all the time.

4. Your AWS account has limited access to AWS services (i.e., those required for the course), and is provided with a budget (currently $50 USD) to spend. These credits cannot be increased, and it is up to you to monitor your cost and usage to make sure that you don't overspend. The credits you have should be enough to last you through the entire course. At the end of the term, your account and all its resources will be deleted.

5. In the CloudLabs page, you will also be given other information. For example, your **AWS Account ID**, which is the unique number of your account (this is not a secret), the **Region** where you will create resources (e.g., `us-east-2`), as well as other items we'll use later in the course. Be aware of what is here, and refer back to this page in subsequent labs.

6. The CloudLabs page also includes **Access Key Details**. These are your [AWS Security Credentials](https://docs.aws.amazon.com/general/latest/gr/aws-security-credentials.html). They include an [Access Key](https://docs.aws.amazon.com/sdkref/latest/guide/setting-global-aws_secret_access_key.html) and a [Secret Access Key](https://docs.aws.amazon.com/sdkref/latest/guide/setting-global-aws_secret_access_key.html). They will look something like this:

```text
Access Key=AKIAIOSFODNN7EXAMPLE
Secret Key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

> [!NOTE]
> Developers often store these credentials in an [`.aws/` folder in your home directory](https://docs.aws.amazon.com/sdkref/latest/guide/file-location.html), for example: `~/.aws/credentials`. For now, you don't need to do anything with them, other than learn where to find them.

We'll need these values in order to work with many AWS tools and SDKs locally. Your credentials should be kept **secret** (especially the `Secret Access Key`). Don't share them or check them into git, dont post them in screenshots or lose them. Failure to protect your cloud credentials could mean a hacker gains access to your account (or your company's account).

## AWS Management Console

1. Access your CloudLabs account and use the **Sign-in link**, **Username**, and **Password** to access the **AWS Management Console** logged into your student account. At the top, click the **Services** button to see a list of all AWS Services, or **Search for services, features, blogs, docs and more**.

2. The first service we'll use is [Amazon Cognito](https://aws.amazon.com/cognito/), which lets you add [user sign-up, sign-in, and access control](https://aws.amazon.com/cognito/details/) to any app. Amazon will automatically manage and securely store your user accounts, providing APIs and UI to authenticate, authorize, and manage users. The service is [free (forever) to use for the first 50,000 users each month](https://aws.amazon.com/cognito/pricing/?loc=ft#Free_Tier), and is then billed per monthly active user. The [docs](https://aws.amazon.com/cognito/getting-started/) have more details about [User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-cognito-user-pools.html) and how to use them.

3. In the **AWS Management Console** search bar, type `Cognito` to find the Amazon Cognito service, or go to [Amazon Cognito > User pools](https://us-east-2.console.aws.amazon.com/cognito/v2/idp/user-pools?region=us-east-2) directly.

## Amazon Cognito User Pool Setup

A [User Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) is a user directory (i.e., account database). Instead of building and maintaining our own auth system, we'll use an Amazon cloud service. We'll rely on a User Pool to [authenticate users in a web app](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-scenarios.html#scenario-basic-user-pool) and to [authorize users of our back-end microservice](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-scenarios.html#scenario-backend). It's important to understand the difference: **authenticate** means to confirm that a user is who they say that they are (username and password) and **authorize** means to check if a known user is allowed to perform some action or access a particular resource.

To create a **User Pool**, click the **Create user pool** button in the AWS Console Amazon Cognito page. If you receive `403 Forbidden` errors, you can ignore them. They refer to API calls that your AWS account is not authorized to make in the AWS Console (this is an example of authorization in the AWS API).

Creating and configuring our User Pool is a multi-step process.

### Step 1: Set up your application

We are creating a **Cognito user pool** for a browser-based, static web app (i.e., no server). As such, we need to select **Single-page application (SPA)** under the **Define your application > Application type** section. Name your application `fragments-ui`, since this will be the UI for testing our `fragments` microservice.

Under **Configure options**, set the **Options for sign-in identifiers** to use **Username** for sign in. If you want to also allow users to sign in with their **Email**, you can select that too.

For the **Required attributes for sign-up**, we need to choose all of the user attributes that will be required when users sign-up. In our case, `email` is obviously necessary, since we're going to validate the user based on their email address. But we can select other attributes, for example `name` is probably useful (e.g., to have a display name for the user); but you can add others if you want. However, whenever possible, try to reduce the amount of data you ask for and collect about your users! Any data that you collect becomes **your** responsibility to secure, maintain, backup, and manage. The less data you store about your users, the better, especially if you ever get hacked or have a data breach. For example, we will never need to know a user's birth date, gender, phone number, etc. so why would we collect this info? Always collect the least amount of data possible and reduce your risk and to protect your users.

> [!NOTE]
> If you make a mistake at this step, you'll have to delete and re-create your User Pool to update it--you can't change these after the pool is created.

Finally, we need to **Add a return URL**. This is the URL where Cognito will redirect users once they have successfully authenticated. Normally, this needs to be a secure `https://` URL (e.g., in production). However, in development, you can use `http://` for `localhost`. Set your **URL** to be <http://localhost:1234>.

> [!NOTE]
> We're using `http` vs. `https`, using `localhost` for our domain, using port `1234` (the default port for the Parcel bundler), and we do NOT have a trailing slash <http://localhost:1234> vs. <http://localhost:1234/>. You can change this later, but for now, make a note of what we set, since you'll need it later on.

Click **Create**. Your User Pool will be created, and you will be provided with a number of important pieces of information:

1. Amazon Region: this will be `us-east-2`, and is the geographic region where our User Pool was created. All AWS resources belong to one or more regions.
1. User Pool Domain and ID: this will look something like <https://cognito-idp.us-east-2.amazonaws.com/us-east-2_qmAN4fYST>. The User Pool ID is the pathname (i.e., `us-east-2_qmAN4fYST`) and the rest is the User Pool Domain
1. User Pool Client ID: this will look something like `74t0ncghlnklgts172f1p3tptl`. This is the ID of the web app that is allowed to connect to your User Pool (i.e., your `fragments-ui`).
1. Redirect URI: this will be the URL you gave for your web app. It's a good idea to record it so you can use it exactly as it is configured in the User Pool--Cognito will reject authentication requests if this URL doesn't match.

## Managing your User Pool in the Console

You can now see your new user pool in the **User pools** page. It should look something like this:

| User pool name       | User pool ID          | Created time | Last updated time |
| -------------------- | --------------------- | ------------ | ----------------- |
| `User pool - rf-mwe` | `us-east-2_qmAN4fYST` | 1 second ago | 1 second ago      |

Click on the **User pool name** link to get more details and to access other settings.

At the top, pay attention to the **User pool overview**, which includes:

- **User pool name**
- **User pool ID**, which we'll need for API calls later
- **Amazon Resource Name (ARN)**, a URI that uniquely identifies this AWS resource (e.g. your user pool vs mine). Every AWS cloud resource has its own ARN

On the left, you can manage various aspects of the User Pool, including the list of **Users** (currently there are none). You can also select other options beside **Users** by choosing from the various tabs:

- Groups
- Applications > App clients (where you configure how your `fragments-ui` will use the User Pool)
- etc

For example, in **Branding** > **Message templates** you can alter the text of the email messages that get sent to users on sign up.

Under **Applications** > **App clients** you can find your `fragments-ui` app's **Client ID** and other settings.

Take a few minutes to explore the various sections and options available for you to edit and configure.

> [!NOTE]
> If you make a mistake, or need to redo the steps above, you can always delete this user pool and start again. Working with the cloud always means we create and destroy things all the time. When you are satisfied that you've done things correctly, move on to the next steps.

## Create the `fragments-ui` web app and repo

1. Before going any further, we need to create a simple web app to manage authentication with our User Pool and test our back-end `fragments` microservice.

2. Similar to what you did in [Lab 1](../lab-01/readme.md) (i.e., you can follow the same basic steps), [create a new **Private GitHub Repo**](https://github.com/new) named `fragments-ui` with a `.gitignore` (for `node`) and a `README.md`.

3. [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) your `fragments-ui` repo to your local machine and go into the `fragments-ui` directory. I would suggest cloning your `fragments-ui` and `fragments` repos in the same parent folder:

```text
cloud-for-programmers/
├─ fragments/
├─ fragments-ui/
```

> [!NOTE]
> these are two separate git repos, but since we'll often be working on them together, it's nice to have them close to each other. You can always move a git repo to a new location, or rename it, using the `mv` command (i.e., it's just a directory that contains a `.git/` sub-directory, there's nothing special about it from a filesystem point of view). If you do decide to work this way, and open the root folder, you should consider duplicating your `.vscode/` directory in the root, since VS Code looks for config files in the root of the opened folder. Otherwise, things like Prettier format-on-save won't work properly.

1. Set up your web project using `npm`:

```sh
cd fragments-ui
npm init -y
```

Edit your `package.json` file to look something like this (change the details to use your own info):

```json
{
  "name": "fragments-ui",
  "private": true,
  "version": "0.0.1",
  "description": "Fragments UI testing web app",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/REPLACE_WITH_YOUR_GITHUB_USERNAME/fragments-ui.git"
  },
  "author": "REPLACE_WITH_YOUR_NAME",
  "license": "UNLICENSED"
}
```

1. You're creating a simple web app for testing your microservice, and you can choose any web framework/libraries that you want to use. It doesn't matter what you use: React, Angular, Vue, Svelte, etc. or no framework at all (i.e., just HTML and JavaScript or TypeScript). It's important to note that we aren't building a production-grade web app. This will be a very simple test UI. Many students use this as a way to play with a new framework they want to learn, others keep things easy and choose HTML, CSS, and JavaScript. It's totally up to you. In my sample code below, I'll use no framework and just write basic HTML, CSS, and JavaScript. You can use this code as a starting point or ignore it completely and do your own thing.

If you choose to use a web framework, install the necessary dependencies and get it set up.

If you choose not to use a framework, you **must** at least use a tool like [Parcel](https://parceljs.org/) to bundle your JavaScript, manage environment variables, and provide hot-reloading. Follow the [installation instructions for using Parcel with a web app](https://parceljs.org/getting-started/webapp/).

> [!NOTE]
> Parcel generates build files (`dist/` directory) and a cache (`.parcel-cache/` directory) that you should add to your `.gitignore`. Build artifacts (i.e., things you generate) don't belong in git.

Because you have already completed all of the web stream courses, I assume that you can create and set up a web app on your own. However, I will give you specific instructions and code related to working with the AWS Cognito User Pool.

Make a note of the **Port** and **Hostname** that your web app runs on locally (i.e., when you `npm start` your app). For example: many React apps run on <http://localhost:3000>; Angular apps on <http://localhost:4200>; and Parcel uses <http://localhost:1234>. Recall that we used a Callback URL of <http://localhost:1234> in the previous steps. If you need to change that, go to **Amazon Cognito** > **User Pools** > **your user pool** > **Applications** > **App clients** > choose your **fragments-ui** app client from the list, then choose **Login pages**.

## Connect Web App to User Pool

Authentication and Authorization are a complicated dance, involving redirects, access codes, tokens, etc. We could write code to do it all manually, but it's hard to get right, and a waste of time for everyone to re-implement. You should almost never "roll your own auth." Always use a pre-made, well-maintained solution to avoid security bugs.

In order to simplify connecting our web app to our Cognito User Pool and Hosted UI, we'll use the [oidc-client-ts](https://github.com/authts/oidc-client-ts) recommended by Amazon.

1. In your `fragments-ui` web app's root folder, run the following command to install it:

```sh
npm install --save oidc-client-ts
```

If you are using a web framework (React, Angular, Vue, Svelte, etc), you can also [install the appropriate custom components](https://ui.docs.amplify.aws/) to use pre-built auth (and other) components.

If you're not using a web framework, create a simple HTML button for the user to `Login`, as well as a place to display the user's `username` or `name` once authenticated. Here's a basic sample, but you can make it look like whatever you want (i.e., this is just to get you started):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Fragments UI</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" />
    <script type="module" src="src/app.js"></script>
  </head>
  <body>
    <h1>Fragments UI</h1>
    <section>
      <nav>
        <button id="login">Login</button>
      </nav>
    </section>
    <section hidden id="user">
      <h2>Welcome <span class="username"></span>!</h2>
    </section>
  </body>
</html>
```

1. In the root of your `fragments-ui` web app repo (i.e., beside your `package.json` file), create an `.env` file to define some [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable). We use an environment file (`.env`) to separate configuration settings from our source code. Our `.env` file will include things like our Cognito configuration settings.

Because an `.env` file often contains secrets, we **never** commit them to git. Our [`.gitignore`](https://git-scm.com/docs/gitignore) tells git which files and folders to ignore in a project. Confirm that your `.gitignore` file includes `.env`. If it doesn't, you can put the following lines at the end of the `.gitignore` file:

```ini
# Don't include .env, which might have sensitive information
.env
```

Your `.env` file contains lines that look like this: `VARIABLE=VALUE` (NOTE: no spaces, no quotes). It also contains comments, which begin with a `#` character: `# This is a comment`.

A process has access to its environment (variables). If you're using Parcel, it can [automatically read environment variables from an `.env` in the root of the project](https://parceljs.org/features/node-emulation/#environment-variables). You can do something similar in [React](https://create-react-app.dev/docs/adding-custom-environment-variables/) and [Angular](https://www.digitalocean.com/community/tutorials/angular-environment-variables) too. Make sure your chosen web framework can work with environment variables so that you don't have to commit these to with our source code.

> [!IMPORTANT]
> You will need the configuration info that you recorded above for your User Pool and App Client ID (replace `xx...` values below)

```ini
# .env

# fragments microservice API URL (make sure this is the right port for you)
API_URL=http://localhost:8080

# AWS Amazon Cognito User Pool ID (use your User Pool ID)
AWS_COGNITO_POOL_ID=us-east-2_xxxxxxxxx

# AWS Amazon Cognito Client App ID (use your Client App ID)
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# OAuth Sign-In Redirect URL (use the port for your fragments-ui web app)
# Be careful with http vs. https and trailing slashes: match what's in Cogntio's config.
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
```

> [!TIP]
> Unlike our `fragments` server, which also uses environment variables, none of the variables/values above are secrets. This is because we are going to include them in our JavaScript code, so they can't be.

Also create a `src/auth.js` file to do the [OAuth2 Authorization Code Grant](https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type). To do so, we first need to configure the `Auth` client with our User Pool details, and provide a way to get the authenticated user's info. We'll use the `process.env` global to access our environment variables:

```js
// src/auth.js

import { UserManager } from 'oidc-client-ts';

const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-2.amazonaws.com/${process.env.AWS_COGNITO_POOL_ID}`,
  client_id: process.env.AWS_COGNITO_CLIENT_ID,
  redirect_uri: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: 'code',
  scope: 'phone openid email',
  // no revoke of "access token" (https://github.com/authts/oidc-client-ts/issues/262)
  revokeTokenTypes: ['refresh_token'],
  // no silent renew via "prompt=none" (https://github.com/authts/oidc-client-ts/issues/366)
  automaticSilentRenew: false,
};

// Create a UserManager instance
const userManager = new UserManager({
  ...cognitoAuthConfig,
});

export async function signIn() {
  // Trigger a redirect to the Cognito auth page, so user can authenticate
  await userManager.signinRedirect();
}

// Create a simplified view of the user, with an extra method for creating the auth headers
function formatUser(user) {
  console.log('User Authenticated', { user });
  return {
    // If you add any other profile scopes, you can include them here
    username: user.profile['cognito:username'],
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
}

export async function getUser() {
  // First, check if we're handling a signin redirect callback (e.g., is ?code=... in URL)
  if (window.location.search.includes('code=')) {
    const user = await userManager.signinCallback();
    // Remove the auth code from the URL without triggering a reload
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }

  // Otherwise, get the current user
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
```

1. Create the `src/app.js` file to run your web app. It should use `src/auth.js` to handle authentication, get the `user`, and update the UI. It doesn't need to do anything more complicated (yet):

```js
// src/app.js

import { signIn, getUser } from './auth';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    return;
  }

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
```

## Test Authentication Flows

1. Your web app should be ready for you to try connecting to your User Pool. Start your web app locally (`npm start`) and open your browser to it. Open your browser's **Dev Tools** so you can see the **Console**. Click the **Login** button. You should be redirected to your Hosted UI domain. If you aren't, look for errors and debug.

2. In the Hosted UI, create a new user by clicking the **Sign up** link. Enter your desired **Username**, **Name**, **Email**, and **Password** (this is a test account, and you can make as many as you like, ideally fewer than 50,000 this month!). Click the **Sign up** button. You will be asked to verify your email by entering a **Verification Code** (check the email you entered above for the code). Once you enter it, you should be redirected back to your local web app (you're now signed in!).

3. Try clicking **Logout** and then trying the **Login** flow (i.e., click the **Login** again). Make sure you can login and logout, and your UI works as you expect.

4. After successfully logging in, inspect the `user` object in the Dev Tools console. Make sure the `username` is correct, and that you have an `idToken` and `accessToken` [JSON Web Tokens (JWT)](https://jwt.io/introduction). One-by-one, copy these JWTs and paste them into the **JWT Debugger** at [jwt.io](https://jwt.io/). Make sure the tokens are valid and can be decoded, and that the [claims](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims) you see make sense (i.e., match the user you logged in with).

5. Go back to the **AWS Console** and the **Cognito** page and select your user pool and the **Users** tab. Find the user you just created in your User Pool.

Congratulations, you've provisioned, configured, and programmed your very first AWS service. Well done! You should `add` and `commit` everything in your `fragments-ui` repo:

```sh
$ git status
...see what's been added and updated
$ git add ...
$ git commit -m "..."
```

## Secure fragments Routes

Now that we have a way to Authenticate users against our Amazon Cognito User Pool, and a way to get Authorization tokens, it's time to secure our `fragments` microservice routes. We'll add the infrastructure we need to properly authorize users with a Cognito **Identity token**.

1. In the root of the `fragments` repo, install the [dotenv](https://www.npmjs.com/package/dotenv) module to your dependencies. We'll use it to read [Environment Variables](https://en.wikipedia.org/wiki/Environment_variable) from an `.env` file, and load the into our node server's environment at startup:

```sh
npm install --save dotenv
git add package.json package-lock.json
git commit -m "Add dotenv"
```

1. We'll change the default entry point of our server, from `src/server.js` to use a new file: `src/index.js`. In this file, we'll begin by loading environment variables from an `.env` file as the first thing we do, and we only need to do this once. We'll create the `.env` file in a minute:

```js
// src/index.js

// Read environment variables from an .env file (if present)
// NOTE: we only need to do this once, here in our app's main entry point.
require('dotenv').config();

// We want to log any crash cases so we can debug later from logs.
const logger = require('./logger');

// If we're going to crash because of an uncaught exception, log it first.
// https://nodejs.org/api/process.html#event-uncaughtexception
process.on('uncaughtException', (err, origin) => {
  logger.fatal({ err, origin }, 'uncaughtException');
  throw err;
});

// If we're going to crash because of an unhandled promise rejection, log it first.
// https://nodejs.org/api/process.html#event-unhandledrejection
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'unhandledRejection');
  throw reason;
});

// Start our server
require('./server');
```

1. Create an [`.env` file](https://github.com/motdotla/dotenv#usage) in the root of your `fragments` repo (e.g., in the same folder as `package.json`). Just like the one we made for `fragments-ui`, your `.env` file contains lines of the form `VARIABLE=VALUE` (NOTE: no spaces, no quotes), and comments beginning with the `#` character: `# This is a comment`. Try setting your `PORT` in the `.env` file:

```ini
# port to use when starting the server
PORT=8080

# which log messages to show (usually `info` for production, `debug` for development, `silent` to disable)
FRAGMENTS_LOG_LEVEL=debug
```

Run your server (e.g., `npm start`) and see if it starts on port `8080`. Now stop the server and change your `.env` file to use `PORT=9000`. Restart your server and make sure it runs on port `9000`. Finally, try commenting out the port in your `.env` (i.e., `#PORT=8080`) and see if it still starts. It should default to use port `8080` if there is no `PORT` defined on the environment (e.g., `const port = parseInt(process.env.PORT || 8080, 10);` in `src/server.js`). When you're done, change the `.env` back to `PORT=8080` so we define (and document) a default value. Do the same for your `FRAGMENTS_LOG_LEVEL` and make sure you know how to change the log messages you see.

1. Confirm that your `.gitignore` file includes `.env`. Remember, we don't **ever** want this file committed to git, since it will eventually contain secrets that shouldn't be shared (e.g., on GitHub). You can put the following lines at the end of the `.gitignore` file if they aren't already included:

```gitignore
# Don't include .env, which might have sensitive information
.env
```

1. Modify all of your startup **scripts** in `package.json` to use `src/index.js` vs. `src/server.js` when starting the server. Confirm that `npm start`, `npm run dev`, and `npm run debug` all continue to work. Once you're satisfied that they do, `add` everything to git and `commit` (hint: use `git status` to see all of the files that have been added or changed). Use a commit message that helps you remember what you did (e.g., `"Switched to src/index.js as main entry point"`).

2. Update your project structure to add a `src/routes/*` folder, and associated files. We'll put all of our server's routes into separate files and folders, to avoid having `src/app.js` get too big. Here's how it should look:

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

You can do that at the command-line with:

```sh
mkdir -p src/routes/api
touch src/routes/index.js
touch src/routes/api/index.js
touch src/routes/api/get.js
```

1. Modify your `src/app.js` file to remove the current health check route (and associated code), and move that logic into `src/routes/index.js` instead:

```js
// modifications to src/app.js

// Remove `app.get('/', (req, res) => {...});` and replace with:

// Define our routes
app.use('/', require('./routes'));
```

Now update the code in `src/routes/index.js` to define our routes:

```js
// src/routes/index.js

const express = require('express');

// version and author from package.json
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json({
    status: 'ok',
    description: 'fragments service running normally',
    author,
    // TODO: change this to use your GitHub username!
    githubUrl: 'https://github.com/REPLACE_WITH_YOUR_GITHUB_USERNAME/fragments',
    version,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
```

1. Start to define the `fragments` API endpoints in `src/routes/api/index.js` (we'll add more here as we expand our implementation in future labs):

```js
// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));
// Other routes (POST, DELETE, etc.) will go here later on...

module.exports = router;
```

1. Start an initial implementation of the `GET /v1/fragments` route in `src/routes/api/get.js`:

```js
// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  res.status(200).json({
    status: 'ok',
    // TODO: change me
    fragments: [],
  });
};
```

1. Test that everything still works, and make sure that `curl localhost:8080` and `curl localhost:8080/v1/fragments` (`curl.exe` in Power Shell) give you the responses you expect. If you have problems, debug and get everything working. Once you're satisfied things work, `add` everything you changed to git and `commit` your changes (hint: you can add an entire directory to git at once in order to include all of the new/updated files within it: `git add src/app.js src/routes`).

2. Add the necessary dependencies in order to use a JWT token to secure our Express routes with [Passport.js](https://www.passportjs.org/), including [passport](https://www.npmjs.com/package/passport), [passport-http-bearer](https://www.npmjs.com/package/passport-http-bearer), and [aws-jwt-verify](https://www.npmjs.com/package/aws-jwt-verify)). Our microservice will use Passport.js to parse the `Authorization` header of all incoming requests and look for a `Bearer` token. We'll then verify this token with the **AWS JWT Verifier** module, and make sure that we can trust the user's identity.

> [!NOTE]
> The [aws-jwt-verify](https://www.npmjs.com/package/aws-jwt-verify) module previously needed to be set to `2.1.3` vs. `4.x` due to a [bug](https://github.com/awslabs/aws-jwt-verify/issues/66) in how it [interacts with Jest](https://github.com/facebook/jest/issues/12270). This should be fixed, but be aware that you can use aws-jwt-verify@2.1.3 instead of aws-jwt-verify below if you have issues.

```sh
npm install --save passport passport-http-bearer aws-jwt-verify
```

1. Add configuration information to your `fragments` server's `.env` so that the **AWS JWT Verifier** knows about your Cognito User Pool (NOTE: use the values you wrote down above for the Amazon Cognito IDs):

```ini
# Port for the server
PORT=8080

# which log messages to show (usually `info` for production, `debug` for development, `silent` to disable)
FRAGMENTS_LOG_LEVEL=debug

# AWS Amazon Cognito User Pool ID (use your User Pool ID)
AWS_COGNITO_POOL_ID=us-east-2_xxxxxxxxx

# AWS Amazon Cognito Client App ID (use your Client App ID)
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

1. Create a `src/auth.js` file to define our Passport strategy and authentication functions:

```js
// src/auth.js

// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).

const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const logger = require('./logger');

// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust. See:
// https://github.com/awslabs/aws-jwt-verify#cognitojwtverifier-verify-parameters
const jwtVerifier = CognitoJwtVerifier.create({
  // These variables must be set in the .env
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  // We expect an Identity Token (vs. Access Token)
  tokenUse: 'id',
});

// Later we'll use other auth configurations, so it's important to log what's happening
logger.info('Configured to use AWS Cognito for Authorization');

// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
// You can try this yourself using:
// curl https://cognito-idp.us-east-2.amazonaws.com/<user-pool-id>/.well-known/jwks.json
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS successfully cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });

module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for the Bearer Token
  // in the Authorization header, then verify that with our Cognito JWT Verifier.
  new BearerStrategy(async (token, done) => {
    try {
      // Verify this JWT
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');

      // Create a user, but only bother with their email. We could
      // also do a lookup in a database, but we don't need it.
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });

module.exports.authenticate = () => passport.authenticate('bearer', { session: false });
```

1. Update the `src/app.js` file to use the new `strategy` we just defined in `src/auth.js`, and to initialize [Passport.js](https://www.passportjs.org/):

```js
// modifications to src/app.js
...
const passport = require('passport');
...
const authenticate = require('./auth');
...
// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes
app.use('/', require('./routes'));
...
```

Try starting your server (`npm run dev`) and check to see if the `Cognito JWKS cached` message gets logged. If you instead see `Unable to cache Cognito JWKS`, something is wrong, and you should debug and fix.

1. Update `src/routes/index.js` to use our `authenticate` middleware for all of the `/v1/*` routes:

```js
// modifications to src/routes/index.js
...
// Our authentication middleware
const { authenticate } = require('../auth');
...
/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));
...
```

Start your server and make sure that `curl -i localhost:8080` returns a `200`, but that `curl -i localhost:8080/v1/fragments` instead returns a `401 Unauthorized`. If they don't work how you expect, debug and fix things until they do, then `add` and `commit` all your updates/changes to git.

## Connect Client Web App to Secure Microservice

We **finally** have all the pieces in place to connect everything together: our Amazon Cognito User Pool; a simple client Web App that can authenticate and get tokens; and a microservice that can secure HTTP access via JWT tokens.

Let's prove that everything works. Our goal is to have a user sign-in via our web app, then use the token we get back from AWS to do a secure `GET` request to our microservice. If all goes well we'll get back a `200` with some data that we can log to the browser console.

1. Add a new file to your `fragments-ui` web app repo called `src/api.js`. In it, define a function to get a user's fragments from the `fragments` microservice:

```js
// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const fragmentsUrl = new URL('/v1/fragments', apiUrl);
    const res = await fetch(fragmentsUrl, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}
```

1. Call your `getUserFragments()` function in `src/app.js` when a user is authenticated on page load:

```js
// modifications to src/app.js
...
import { getUserFragments } from './api';
...
async function init() {
  ...
  const user = await getUser();
  ...
  // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user);

  // TODO: later in the course, we will show all the user's fragments in the HTML...
}
```

1. Open two terminals: one to run your web app client and the other to run your microservice at the same time.

In the first terminal, start your `fragments` server on port `8080` (or whatever port you specified in your `.env` and `src/app.js`) using `npm run dev` (HINT: use the `dev` script to start your server in debug mode, so the logs are pretty-printed and easier to read).

In the second terminal, start your `fragments-ui` web app client on port `1234` (or whatever port you've used). Browse to your `fragments-ui` front-end web app and open your browser's **Dev Tools** so that you can see the **Console**.

Click the **Login** button and sign-in with Cognito. When you are redirected back to your web app, make sure the console shows a successful result for the authenticated `GET /v1/fragments` request. If it doesn't, debug and fix.

Take a look at the logs that your `fragments` server produced. Make sure you see the successful request and response, and that the token is being sent in the `Authorization` header.

## Submission

In order to submit your lab, please do all of the following steps and submit the results to Blackboard:

1. Make sure that all of the changes in both the `fragments` repo and `fragments-ui` repo are committed in git (i.e., `add`, `commit`). Once you have done that for each repo, `push` your commits to GitHub (i.e., `git push origin main`) for both repos one-by-one. Confirm that the code in GitHub is what you expect for both repos. If it isn't, fix things, `add`, `commit` and `push` again until it is.

2. [Invite your professor as a collaborator](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-user-account/managing-access-to-your-personal-repositories/inviting-collaborators-to-a-personal-repository) to your private `fragments-ui` web front-end repo. NOTE: only you and your professor should have access to this code. Do not share it with other students. You can use the GitHub Discussions to talk about your code, but not share it directly.

3. Submit the links to both your `fragments` and `fragments-ui` repos.

4. Open your browser with the **Dev Tools** and **Console** showing, and take screenshots of all of the following scenarios (include the entire browser in the screenshot, including the address bar and URL):
   3.1 Page load when not logged in
   3.2 Clicking the **Login** button and being redirected to the **Hosted UI**
   3.3 Page load when logged in (should display the username) and the Console should show a successful request to get the user's fragments.

5. Take a screenshot of the **AWS Console Cognito** page in the **Users and groups** section for your User Pool, showing the user you created when you signed up.

6. Take a screenshot(s) of your `fragments` server logs showing: a) the Cognito service being started; b) an authenticated user accessing a protected route successfully; c) an unauthenticated user attempting to access a protected route, but it failing. The log messages and HTTP Status Codes should be clearly visible. Make sure you know how to read logs and debug what is happening in your system.

7. After you successfully log in, copy the `idToken` value from the `user` object in the console to your clipboard and paste it into the JWT Debugger at [jwt.io](https://jwt.io). Take a screenshot of the **Decoded** payload.
