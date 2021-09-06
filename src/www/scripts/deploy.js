#!/usr/bin/env node
/* eslint-disable no-console */

const { _: args, '$0': processName } = require('yargs').argv;
const { execSync } = require('child_process');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const mime = require('mime-types');

// Validation
const environmentId = args[0];
if (environmentId === undefined || environmentId.trim() === '') {
  console.error("No environment name specified (e.g. dev)");
  console.error(`Usage: ${processName} (environment_name)`);
  process.exit(1);
} else if (environmentId === 'local') {
  console.error("Cannot deploy to local environment - WWW does not run in localstack. Just run it locally instead (e.g. 'npm start')");
  process.exit(5);
}
if (!fs.existsSync('package.json')) {
  console.error("You must run this script from the project root.");
  process.exit(2);
}

// Config
const buildDirectory = './out';

// Environment config
process.env['ENVIRONMENT_ID'] = environmentId;
process.env['NODE_ENV'] = 'production';

// Fetch config from terraform
const terraformEnvironmentPath = `../../terraform/environments/${environmentId}`;
if (!fs.existsSync(terraformEnvironmentPath)) {
  console.error(`No terraform environment with id: '${environmentId}'`);
  process.exit(4);
}
const rawTerraformOutput = exec('terraform output --json', {
  cwd: terraformEnvironmentPath,
  stdio: 'pipe',
});
const terraformOutput = JSON.parse(rawTerraformOutput);
/** @type {string[]} */
const bucketName = terraformOutput['www_bucket_name'].value;
/** @type {string} */
const awsRegion = terraformOutput['aws_region'].value;

// Build project
exec('npm install && npm run build');

void (async () => {
  // Upload files to s3
  const s3Client = new S3Client({
    region: awsRegion,
  });

  // Read all files we have
  const filesToUpload = getAllFiles('./out');

  console.log(`Uploading ${filesToUpload.length} files to S3...`);
  let totalUploaded = 0;

  // Upload all files in parallel, wait for them all to finish
  await Promise.all(filesToUpload.map(async (file) => {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      ACL: 'public-read',
      Key: path.relative(buildDirectory, file),
      Body: fs.readFileSync(file),
      ContentType: getContentType(file),
    }));

    console.log(`[${++totalUploaded}/${filesToUpload.length}] Uploaded: ${file} [${getContentType(file)}]`);
  }));

  console.log(`Successfully deployed www to bucket: ${bucketName}.`);
})();

/**
 * @param {string} command Command to exec
 * @param {import('child_process').ExecSyncOptionsWithStringEncoding} options
 */
function exec(command, options = {}) {
  console.log(`[exec]: ${command}`);

  return execSync(command, {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });
}

/**
 * @param {string} directory Directory to read all files from, recursively
 * @param {string[]} _files Temporary result variable (don't pass, used for recursion)
 * @returns {string[]}
 */
function getAllFiles(directory, _files = []) {
  // From: https://stackoverflow.com/a/66187152
  const filesInDirectory = fs.readdirSync(directory);
  for (const fileName of filesInDirectory) {
    const filePath = path.join(directory, fileName);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, _files);
    } else {
      _files.push(filePath);
    }
  }

  return _files;
}

/**
 * @param {string} filePath File path to get MIME content type for
 * @returns {string}
 */
function getContentType(filePath) {
  const ext = path.extname(filePath);

  // Manual content-type overrides
  if (ext === '.ico') {
    // Favicons. Default works, but this is a bit better / more standard
    return 'image/x-icon';
  } else {
    return mime.contentType(ext);
  }
}
