const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const logger = require('../../../logger'); 

const bucketName = process.env.AWS_S3_BUCKET_NAME;

function writeFragment(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

// Reads a fragment metadata from DynamoDB. Returns a Promise<fragment|undefined>
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}

async function writeFragmentData(ownerId, id, buffer) {
  const key = `${ownerId}/${id}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err, bucketName, key }, 'Error writing fragment data to S3');
    throw new Error('Unable to call AWS S3 to write fragment data');
  }
}

async function readFragmentData(ownerId, id) {
  const key = `${ownerId}/${id}`;
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    return await streamToBuffer(response.Body);
  } catch (err) {
    logger.error({ err, bucketName, key }, 'Error reading fragment data from S3');
    throw new Error('Unable to call AWS S3 to read fragment data');
  }
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Get a list of fragments, either ids-only, or full Objects, for the given user.
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  const command = new QueryCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return !expand ? data?.Items.map((item) => item.id) : data?.Items;
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}

// Delete a fragment's data from S3 and metadata from DynamoDB
async function deleteFragment(ownerId, id) {
  const key = `${ownerId}/${id}`;
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const deleteParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };
  const deleteCommand = new DeleteCommand(deleteParams);

  try {
    await Promise.all([
      ddbDocClient.send(deleteCommand),
      s3Client.send(deleteObjectCommand),
    ]);
  } catch (err) {
    logger.error({ err, bucketName, key }, 'Error deleting fragment from S3/DynamoDB');
    throw new Error('Unable to delete fragment');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;