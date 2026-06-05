# Lab 9

In this lab we will explore how to use [AWS S3](https://aws.amazon.com/s3/) and the [Amazon AWS S3 JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html). We will also continue to practice working with `docker compose`, authoring compose files, and using Hurl to write more integration tests.

When you are done, you will have added [AWS S3](https://aws.amazon.com/s3/) support to your `fragments` microservice, and also created local and testing environments to validate it.

## AWS S3 Overview

[AWS S3](https://aws.amazon.com/s3/) is one of the oldest and most popular AWS services. It is designed to store unlimited amounts of data with high durability and availability, and do it cheaply. Whenever data storage is part of an application's architecture, [AWS S3](https://aws.amazon.com/s3/) is the very first service that should be considered.

A good way to think about [AWS S3](https://aws.amazon.com/s3/) is to imagine a **hash table** in the cloud: **key/value** pairs used to store and access data. [AWS S3](https://aws.amazon.com/s3/) is also known as an **object store**, since we use it to store objects (i.e., arbitrary **blobs** of binary data), for example:

- static web sites
- Docker images
- database backups
- videos
- machine learning models
- log files
- documents
- user-uploaded images
- "big data" data sets

You can store _any kind_ and _any amount_ of data (up to 5TB for an individual object). Each objects has a unique **key** value (i.e., a string, like a file path), and these **keys** are stored in uniquely named collections called **buckets**. You've used [AWS S3](https://aws.amazon.com/s3/) many times without knowing it. For example, when you submit an assignment on Blackboard, behind the scenes it's being uploaded to an S3 bucket.

There are lots of services that do something similar to [AWS S3](https://aws.amazon.com/s3/), namely, allow for storing arbitrary files in the cloud: [Dropbox](https://www.dropbox.com/), [Microsoft OneDrive](https://www.microsoft.com/en-ww/microsoft-365/onedrive/online-cloud-storage), [Google Drive](https://www.google.com/intl/en_ca/drive/), [iCloud Drive](https://www.icloud.com/iclouddrive), and many more. All of these services charge a monthly fee for a fixed amount of storage.

[AWS S3](https://aws.amazon.com/s3/) is different. While individuals can use it to store their data, the primary use case is to build back-end storage support into other applications. As a result, Amazon doesn't charge a monthly fee for a fixed amount of storage. Rather, [AWS S3](https://aws.amazon.com/s3/) provides an unlimited amount of storage, which is billed on-demand. Whether you use 300 bytes or 300 TB in a month, that's the amount you'll be billed. There are also different [storage classes](https://aws.amazon.com/s3/storage-classes/), which become even cheaper the less frequently you need to access the data.

Buckets and objects are managed via REST API calls to AWS. Various clients exist to help you create these requests: the [AWS Console](https://s3.console.aws.amazon.com/s3/home?region=us-east-2), the [AWS s3 CLI](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html), or the [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html).

We'll experiment with all three.

## 1. Create an S3 Bucket

Before you can work with [AWS S3](https://aws.amazon.com/s3/), you need to create a **bucket**. There are various ways to accomplish this, and we'll practice a few, beginning with the **AWS Console**.

1. Open the **AWS Console** for your CloudLabs account
2. Search for **S3** in the list of services
3. Click **Create bucket**
4. Pick a name for your bucket. It must be between **3-63 characters** in length, and **must be unique**. For our purposes, choose something that uses your name, like `<seneca-username>-fragments`, for example: `david.humphrey-fragments`.
5. All buckets belong to a **region**, and we'll use `us-east-2`
6. For **Object Ownership**, we'll disable other accounts from accessing the objects: **ACLs disabled (recommended)**. We want to lock down our data as much as possible.
7. We'll also **Block all public access** to this bucket. It is possible to enable public access (e.g., to host a static web site from a bucket), but we'll mediate access to our bucket's objects via our `fragments` service (i.e., only it needs access).
8. We'll **Disable** the **Bucket Versioning** option
9. Amazon automatically encrypts all objects at rest in S3 buckets (this used to be optional), which adds extra security for our data. We'll use the default **Amazon S3 managed keys** to do it.
10. Click **Create bucket**

## 2. Manually Upload a File

Before we programmatically work with our bucket, we'll try working with it manually in the console.

1. Click on the bucket you just created in step 1
2. Click the **Upload** button
3. Click **Add files** and choose a file to upload (e.g., a text file, JavaScript file from your repo, an image, etc)
4. Click the **Upload** button to upload it. Notice the **Destination** URI you are given (e.g., `s3://david.humphrey-fragments`).
5. Confirm that the file has been added to your bucket.

## 3. Using the AWS S3 CLI

Next, let's try using the [AWS s3 CLI](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/s3/index.html).

1. Using the **AWS CLI**, enter the following command (NOTE: your prompt will look slightly different):

```sh
aws s3 ls
```

1. You should see a list of your **Buckets**, including the bucket you created in step 1.
2. List the contents of the bucket, by including it in your command:

```sh
aws s3 ls david.humphrey-fragments
```

1. Confirm that the file(s) you just uploaded are indeed listed in the bucket.
2. Delete the file. To do so, you'll need to use a full **S3 URI**, which takes the form: `s3://<bucket-name>/<file-name>`:

```sh
ddd_v1_w_ysZ_1002077@runweb52179:~$ aws s3 rm s3://david.humphrey-fragments/filename.txt
delete: s3://david.humphrey-fragments/filename.txt
```

## 4. Using the S3 SDK with fragments

Now that we have the basic idea, let's move toward using the [S3 AWS SDK for JavaScript](https://www.npmjs.com/package/@aws-sdk/client-s3), which is how we'll primarily work with [AWS S3](https://aws.amazon.com/s3/). All of the clients (console, cli, SDK) work the same way: they create HTTP requests and send commands to S3. The [S3 AWS SDK for JavaScript](https://www.npmjs.com/package/@aws-sdk/client-s3) helps us do this with JavaScript or TypeScript.

1. Start by installing `V3` of the [S3 AWS SDK for JavaScript](https://www.npmjs.com/package/@aws-sdk/client-s3):

> [!NOTE]
> There is also an [older version - https://www.npmjs.com/package/aws-sdk](https://www.npmjs.com/package/aws-sdk) that we will **not** use, and which you'll see used in various places on the web.

```sh
cd fragments
npm install --save @aws-sdk/client-s3
```

1. Previously, we created an in-memory data model for our backend. Now we're going to create a second one to work with AWS. To do this, make a copy of the `src/model/data/memory/*` directory in `src/model/data/aws/*`. Our `aws` data model will use the same module structure, but replace the in-memory database with [AWS S3](https://aws.amazon.com/s3/) (and eventually [DynamoDB](https://aws.amazon.com/dynamodb/)).
2. Update `src/model/data/index.js` so that it decides which backend data model to use at runtime, depending on whether an `AWS_REGION` is set in the environment. We'll use this variable as a cue to our server, so that it can use either the in-memory DB (i.e., no `AWS_REGION` set) or use AWS services (i.e., `AWS_REGION` is set):

```js
// src/model/data/index.js

// If the environment sets an AWS Region, we'll use AWS storage
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
// Warn the user in case this wasn't intentional.
const { AWS_REGION } = process.env;
if (!AWS_REGION) {
  logger.warn('No AWS_REGION environment variable set. Using MemoryDB vs. AWS storage');
}
module.exports = AWS_REGION ? require('./aws') : require('./memory');
```

1. Delete the file `src/model/data/aws/memory-db.js`, since we don't need it; replace it with a new file: `src/model/data/aws/s3Client.js`. This file will configure the [S3 SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html), so that we can issues **commands**. We're going to write this code in such a way that we can easily swap the implementation of S3 that we use at runtime (e.g., use [MiniStack](https://ministack.org/) for testing). Most AWS SDK clients and CLI tools can use an `endpoint` URL, to override the service to use.

> [!IMPORTANT]
> To use MiniStack S3 vs. Amazon S3 with your `fragments` server, you'll have to specify `AWS_S3_ENDPOINT_URL=http://localhost:4566` in your environment to override the default.

```js
// src/model/data/aws/s3Client.js

/**
 * S3 specific config and objects.  See:
 * https://www.npmjs.com/package/@aws-sdk/client-s3
 */
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

/**
 * If AWS credentials are configured in the environment, use them. Normally when we connect to S3
 * from a deployment in AWS, we won't bother with this.  But if you're testing locally, you'll need
 * these, or if you're connecting to MiniStack
 * @returns Object | undefined
 */
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // See https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/modules/credentials.html
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    logger.debug('Using extra S3 Credentials AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    return credentials;
  }
};

/**
 * If an AWS S3 Endpoint is configured in the environment, use it.
 * @returns string | undefined
 */
const getS3Endpoint = () => {
  if (process.env.AWS_S3_ENDPOINT_URL) {
    logger.debug({ endpoint: process.env.AWS_S3_ENDPOINT_URL }, 'Using alternate S3 endpoint');
    return process.env.AWS_S3_ENDPOINT_URL;
  }
};

/**
 * Configure and export a new s3Client to use for all API calls.
 * NOTE: we want to use this client with both AWS S3, but also
 * MiniStack in development and testing. We may or may
 * not have various configuration settings, and will pass
 * `undefined` when we don't (i.e. we'll ignore them).
 */
module.exports = new S3Client({
  // The region is always required
  region: process.env.AWS_REGION,
  credentials: getCredentials(),
  // The endpoint URL is optional
  endpoint: getS3Endpoint(),
  // We always want to use path style key names
  forcePathStyle: true,
});
```

1. In `src/model/data/aws/index.js`, update the `require()` path for the `MemoryDB` module. Even though we're switching to use [S3](https://aws.amazon.com/s3/) for our fragment **data**, we still need to use the `MemoryDB` for our fragment **metadata**, since we haven't added [DynamoDB](https://aws.amazon.com/dynamodb/) yet (i.e., we'll continue to fake some parts of our AWS backend). The updated code should look like this:

```js
// XXX: temporary use of memory-db until we add DynamoDB
const MemoryDB = require('../memory/memory-db');
```

1. In `src/model/data/aws/index.js`, modify the `writeFragmentData` function to use our `s3Client` and the [`PutObjectCommand` from the SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html). An S3 `PUT` command **sends data to a bucket**, and needs to be configured with the **bucket name**, a **key**, and the **data** (i.e., a `Buffer`):

```js
const s3Client = require('./s3Client');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

...

// Writes a fragment's data to an S3 Object in a Bucket
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#upload-an-existing-object-to-an-amazon-s3-bucket
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}
```

1. Next, modify the `readFragmentData` function to use our `s3Client` and the [`GetObjectCommand` from the SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html). An S3 `GET` command **retrieves an object from a bucket**, and needs to be configured with the **bucket's name** and an object's **key**. It returns a [stream](https://nodejs.org/api/stream.html#stream) that we can use to get our data out of S3. Streams are a more efficient way to pass large amounts of data around without having to hold everything in memory. Instead of sending the data all at once, it flows a bit at a time, until we have it all. Since our API uses `Buffer`s vs. `stream`s, we'll need to convert the `stream` into a `Buffer` before returning it, by reading all the data from the stream and then creating a new `Buffer`:

> [!NOTE]
> You could rewrite your Express code to `pipe` the `stream` to `res`, but I'll leave that to you if you're interested.

```js
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

...

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new `data` is available,
    // if there's an `error`, and when we're at the `end`
    // of the stream.

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#getting-a-file-from-an-amazon-s3-bucket
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}
```

1. Now it's your turn. Follow the same pattern we've used above in order to update the `deleteFragment` function. Currently, it deletes the fragment's metadata **and** data from the in-memory db. Change it so that the **data** gets deleted from S3. If you haven't already implemented the `DELETE /fragments/:id` route in the assignment spec, you should do that now too, so you can test that everything works.

## 5. Write an Integration Test

At this point you have modified your `fragments` server to use [AWS S3](https://aws.amazon.com/s3/), but does it work? It's hard to know until we write a test! We could rely on our unit tests, but they won't tell us if our new code works in combination with [AWS S3](https://aws.amazon.com/s3/).

Using what you learned in the previous lab, write a new **integration test** named `tests/integration/lab-9-s3.hurl`. This test will make sure that the following steps all work together (i.e., do each of these steps and checks one after the other in the same `.hurl` file):

1. `POST` a new text `fragment` to `http://localhost:8080` as an authorized user. The fragment's body should be the string, `Hello S3!`.
2. Confirm that the server returns a `201`, and **capture** the **Location** header value to a variable named `url`
3. `GET` the `fragment` you just created using the `url` as an authorized user.
4. Confirm that the server returns a `200`, that the type of the fragment is `text/plain`, and that the `body` is equal to `Hello S3!`
5. `DELETE` the `fragment` using the `url` as an authorized user.
6. Confirm that the server returns a `200`.
7. Try to `GET` the `fragment` again using the `url` as an authorized user.
8. Confirm that the server returns a `404`, since the fragment should be deleted.

In order to run this test, we need to run our server so it has access to `S3`. We could try to get this code working against the real S3, but doing so would require you to `push`, `tag`, and `deploy` your code to Elastic Container Service over and over again until you get all bugs worked out. The process would not be fun!

A better way is to use a local S3 server to simulate AWS.

## 6. Using MiniStack for S3 Development

In our previous lab, we created `docker-compose.yml` and set up a [MiniStack](https://ministack.org/) service to run a local version of AWS S3. We also created a script, `scripts/local-aws-setup.sh` to set up our AWS resources in [MiniStack](https://ministack.org/) (e.g., create an S3 bucket).

We'll use these now to test and debug our integration test and S3 code.

1. Start the Docker containers for your offline setup, and have `docker compose` re-build your `fragments` image (i.e., use the `--build` flag):

```sh
cd fragments
docker compose up --build -d
```

1. In a Unix shell, run the `scripts/local-aws-setup.sh` script to create your `fragments` bucket:

> [!IMPORTANT]
> You will need to do this **every** time you (re)start the containers, since they don't store any data to disk.

```sh
$ ./scripts/local-aws-setup.sh
Setting AWS environment variables for MiniStack
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-2
Waiting for MiniStack S3...
MiniStack S3 Ready
Creating MiniStack S3 bucket: fragments
{
    "Location": "/fragments"
}
Creating DynamoDB-Local DynamoDB table: fragments
{
    "TableDescription": {
        "AttributeDefinitions": [
            {
                "AttributeName": "ownerId",
                "AttributeType": "S"
            },
            {
                "AttributeName": "id",
                "AttributeType": "S"
            }
        ],
        "TableName": "fragments",
        "KeySchema": [
            {
                "AttributeName": "ownerId",
                "KeyType": "HASH"
            },
            {
                "AttributeName": "id",
                "KeyType": "RANGE"
            }
        ],
        "TableStatus": "ACTIVE",
        "CreationDateTime": "2022-03-27T18:15:52.966000-04:00",
        "ProvisionedThroughput": {
            "LastIncreaseDateTime": "1969-12-31T19:00:00-05:00",
            "LastDecreaseDateTime": "1969-12-31T19:00:00-05:00",
            "NumberOfDecreasesToday": 0,
            "ReadCapacityUnits": 10,
            "WriteCapacityUnits": 5
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/fragments"
    }
}
```

1. In another terminal, start streaming the logs from your `fragments` server, so you can see what's happening when the tests run. Use `docker ps` to find your `fragments` service, and get its `CONTAINER ID`, which will look something like `26bf87fafef5`. Use that `CONTAINER ID` to get logs for the container:

```sh
docker ps
docker logs -f 26bf87fafef5
```

> [!TIP]
> You could skip the `docker ps` part by giving your container a name in the `docker-compose.yml` file, see the [docs for `container_name`](https://docs.docker.com/compose/compose-file/compose-file-v3/#container_name).

1. In another terminal, run your integration test with `hurl`:

```sh
$ cd fragments
$ npm run test:integration
tests/integration/lab-9.hurl: RUNNING [1/1]
tests/integration/lab-9.hurl: SUCCESS
--------------------------------------------------------------------------------
Executed:  1
Succeeded: 1 (100.0%)
Failed:    0 (0.0%)
Duration:  100ms
```

If your test doesn't pass, look at the line that is failing and figure out which part of the test is not working. Use that to debug your server. You should inspect your logs for any clues as well.

Whenever you make changes to your server code, you'll need to rebuild and restart your `fragments` container. However, we don't need/want to restart the other containers, which are running fine. You can do that using the `--no-deps` option, and passing the `fragments` service name in order to rebuild/restart without touching the other containers:

```sh
docker compose up --build --no-deps -d fragments
```

1. When you have your test passing, stop your containers using the following:

```sh
docker compose down
```

## 7. Run Locally with AWS S3

Now that you know your S3 code works against MiniStack, let's test it against your **real** S3 bucket on AWS. We'll do this by running your `fragments` Docker container locally (i.e., on your own computer), but passing in your real **AWS credentials as environment variables** so the server can connect to your actual S3 bucket.

### Passing AWS Credentials to a Local Container

When your container runs locally, it has no automatic access to your AWS account (unlike when it runs on ECS, which we'll set up later as part of Assignment 3). You need to explicitly pass your AWS credentials and configuration as environment variables when starting the container.

You can find your AWS credentials in your CloudLabs environment (look for `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`).

> [!IMPORTANT]
> Never hard-code your AWS credentials into your source code, Dockerfile, or docker-compose files. Always pass them at runtime via environment variables or a `.env` file that is listed in `.gitignore`.

1. First, build your Docker image locally:

```sh
cd fragments
docker build -t fragments:latest .
```

1. Run the container, passing in the necessary environment variables. You need to provide your AWS credentials, region, S3 bucket name, and any other configuration your server requires (e.g., `HTPASSWD_FILE` or Cognito settings for auth). Here's an example using `docker run` with `-e` flags:

```sh
docker run --rm -p 8080:8080 \
  -e AWS_ACCESS_KEY_ID=<your-access-key-id> \
  -e AWS_SECRET_ACCESS_KEY=<your-secret-access-key> \
  -e AWS_SESSION_TOKEN=<your-session-token-if-applicable> \
  -e AWS_REGION=us-east-2 \
  -e AWS_S3_BUCKET_NAME=<your-bucket-name> \
  -e HTPASSWD_FILE=tests/.htpasswd \
  -e FRAGMENTS_LOG_LEVEL=debug \
  fragments:latest
```

> [!TIP]
> If you have many environment variables, you can put them in a `.env` file (make sure it's in `.gitignore`!) and use `docker run --env-file .env` instead of passing each one with `-e`. For example, create a file called `.env.aws`:
>
> ```
> AWS_ACCESS_KEY_ID=AKIA...
> AWS_SECRET_ACCESS_KEY=wJalr...
> AWS_SESSION_TOKEN=FwoG...
> AWS_REGION=us-east-2
> AWS_S3_BUCKET_NAME=yourname-fragments
> HTPASSWD_FILE=tests/.htpasswd
> FRAGMENTS_LOG_LEVEL=debug
> ```
>
> Then run: `docker run --rm -p 8080:8080 --env-file .env.aws fragments:latest`

1. With the container running, use your `fragments-ui` web app (pointed at `http://localhost:8080`) or `curl` to create a new fragment.

2. In the **AWS Console** for **S3**, navigate to your **bucket** and confirm that the fragment **object** has been created. It will have a **key** like `63258595765642a14e8a725a22b18eab2ae02882a1e13525c6f500532eaa31f5/524RQdhMzifPRhlKI1G-V` (i.e., `ownerId/fragment-id`).

## 8. Differences when Deploying to AWS ECS

Later, in Assignment 3, you will deploy your `fragments` service to the **Elastic Container Service (ECS)**. When running on ECS, you won't need to pass AWS credentials manually. Instead, your container will **assume an IAM Role** that grants it permission to access S3 (and later DynamoDB).

When running locally (as you just did in step 7), you had to explicitly pass `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to your container. On ECS, this isn't necessary. Instead, we assign an **IAM Role** to the ECS task, and the AWS SDK automatically picks up the permissions from that role.

In our AWS account, we've been using the `LabRole` whenever we created new resources. Doing so means that we can share access between resources, since they all share the same IAM role. The `LabRole` IAM role is pre-defined for us, and allows AWS resources we create in our account to be used together.

---

## Submission

- Link to your completed `tests/integration/lab-9-s3.hurl` in your `fragments` GitHub repo
- Screenshot of your `tests/integration/lab-9-s3.hurl` test passing, when run against your `fragments` server and `MiniStack` using `docker compose` (i.e., show the terminal(s) running the necessary commands to make this happen)
- Screenshot of your `fragments` Docker container running locally with your real AWS credentials, and your `fragments-ui` creating a fragment against it (i.e., show the **Network** tab to prove which back-end service is being used at `localhost:8080`)
- Screenshot of the **AWS S3 Console** showing the fragment you just created in S3 as an object in your bucket (i.e., the IDs should match, prove that you've been able to create the fragment data in your real S3 bucket)
- Screenshot of your current account costs in the AWS Console
