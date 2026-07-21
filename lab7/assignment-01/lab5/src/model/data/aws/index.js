const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('./s3Client');
const MemoryDB = require('../memory/memory-db');
const logger = require('../../../logger'); 

const metadata = new MemoryDB();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

function writeFragment(fragment) {
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

async function readFragment(ownerId, id) {
  const serialized = await metadata.get(ownerId, id);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
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

async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  if (!fragments) {
    return [];
  }

  if (expand) {
    return fragments.map((fragment) => (typeof fragment === 'string' ? JSON.parse(fragment) : fragment));
  }

  return fragments.map((fragment) => (typeof fragment === 'string' ? JSON.parse(fragment).id : fragment.id));
}

async function deleteFragment(ownerId, id) {
  const key = `${ownerId}/${id}`;
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await Promise.all([
      metadata.del(ownerId, id),
      s3Client.send(deleteCommand),
    ]);
  } catch (err) {
    logger.error({ err, bucketName, key }, 'Error deleting fragment from S3/Metadata');
    throw new Error('Unable to delete fragment');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;