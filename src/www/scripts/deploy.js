#!/usr/bin/env node
/* eslint-disable no-console */

const { _: args, '$0': processName } = require('yargs').argv;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Validation
const environmentName = args[0];
if (environmentName === undefined || environmentName.trim() === '') {
  console.error("No environment name specified (e.g. dev)");
  console.error(`Usage: ${processName} (environment_name)`);
  process.exit(1);
} else if (environmentName === 'local') {
  console.error("Cannot deploy to local environment - WWW does not run in localstack. Just run it locally instead (e.g. 'npm start')");
  process.exit(5);
}
if (!fs.existsSync('package.json')) {
  console.error("You must run this script from the project root.");
  process.exit(2);
}

// Fetch config from terraform
const terraformEnvironmentPath = `../../terraform/environments/${environmentName}`;
if (!fs.existsSync(terraformEnvironmentPath)) {
  console.error(`No terraform environment named '${environmentName}'`);
  process.exit(4);
}
const rawTerraformOutput = exec('terraform output --json', {
  cwd: terraformEnvironmentPath,
  stdio: 'pipe',
});
const terraformOutput = JSON.parse(rawTerraformOutput);
/** @type {string[]} */
const bucketName = terraformOutput['www_bucket_name'].value;

// Build project
exec('npm install && npm run build');

// Deploy using `gatsby-plugin-s3`
const npmBinDirectory = exec('npm bin', { stdio: 'pipe' }).trim();
exec(`AWS_PROFILE=our-text-adventure ${path.join(npmBinDirectory, 'gatsby-plugin-s3')} --yes --bucket ${bucketName}`);

// Sync files to s3
// @TODO Maybe this should be public
// exec(`aws s3 sync . "s3://${bucketName}" --acl 'private' --profile 'our-text-adventure'`);

console.log(`Successfully deployed www to bucket: ${bucketName}.`);

/**
 *
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
