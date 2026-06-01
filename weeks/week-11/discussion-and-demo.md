# Discussion and Demo

## S3 Signed URLs

- [Sharing objects using presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
- [S3 Request Presigner](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_request_presigner.html)

### Sign a URL with the SDK

```js
// src/model/data/aws/signed-url.js

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = require('./s3Client');

/**
 * Get a signed URL to GET an existing fragment
 * @param {Fragment} fragment
 * @param {number} expiresIn number of seconds
 * @returns Promise<string>
 */
module.exports = (fragment, expiresIn = 3600) => {
  const { ownerId, id } = fragment;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  });

  // NOTE: needs to get signed by AWS, returns a Promise<string>
  return getSignedUrl(s3Client, command, { expiresIn });
};
```

### `GET /fragments/:id/share`

```js
// src/routes/api/get-id-share.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

const signedUrl = require('../../model/data/aws/signed-url');

/**
 * Get a signed URL to share this fragment
 */
module.exports = async (req, res, next) => {
  const user = req.user;
  const id = req.params.id;

  try {
    const fragment = await Fragment.byId(user, id);
    const url = await signedUrl(fragment);

    logger.debug({ url, fragment }, 'signed URL for fragment');
    res.status(201).json(
      createSuccessResponse({
        url,
      })
    );
  } catch (err) {
    logger.info({ err, user, id }, 'GET fragment/:id/share error');
    return next(createErrorResponse(404, `unable to get fragment with id ${id}`));
  }
};
```

## Hurl Docker

- [Hurl Docker Image](https://github.com/Orange-OpenSource/hurl/pkgs/container/hurl⁠)

### Hurl Test

```text
# 1. Create a new fragment as an authenticated user
POST http://fragments:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
`If you can see this, you have got S3 signed URLs working`

HTTP/1.1 201
[Captures]
url: header "Location"

# 2. Get a signed URL for the fragment as an authenticated user
GET {{url}}/share
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 201
[Captures]
signed-url: jsonpath "$.url"

# 3. Try to get the signed URL as an unauthenticated user
GET {{signed-url}}

HTTP/1.1 200
`If you can see this, you have got S3 signed URLs working`
```

### Docker Compose File

NOTE: we're going to run all of these containers on the Docker network, nothing will use `localhost` (i.e., we'll use `http://container:port` style naming). We also won't bother exposing any `ports` on the host. We do this so that our `hurl` test can access the S3 endpoint.

```yml
# docker-compose.yml

services:
  fragments:
    init: true
    build: .
    environment:
      - API_URL=http://fragments:8080
      - HTPASSWD_FILE=tests/.htpasswd
      - FRAGMENTS_LOG_LEVEL=${FRAGMENTS_LOG_LEVEL:-debug}
      - AWS_REGION=us-east-2
      - AWS_S3_ENDPOINT_URL=http://ministack:4566
      - AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME:-fragments}

  ministack:
    image: ministackorg/ministack
    environment:
      - SERVICES=s3
      - MINISTACK_REGION=us-east-2
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}

  hurl-test:
    image: ghcr.io/orange-opensource/hurl
    # Run our test file on startup
    command: ['--test', '--color', '/tmp/share.hurl']
    # Mount our test file into the container
    volumes:
      - ./tests/integration/share.hurl:/tmp/share.hurl
```

### Running Everything

1. Start the `ministack` container: `docker compose up ministack -d`
2. Create the `fragments` S3 bucket in `ministack`: `./scripts/local-aws-setup.sh`
3. (Re)Build and start the `fragments` container: `docker compose up --build fragments -d`
4. Run the `hurl-test` container: `docker compose up hurl-test`

Checkout the logs for your containers to see what's happening, repeat any of the steps above as necessary, then `docker compose down` when finished.
