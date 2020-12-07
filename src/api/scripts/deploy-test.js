#!/usr/bin/env node

const { _: args, '$0': processName } = require('yargs').argv;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const buildDirectory = 'build';
const zipFileName = "api.zip";

// Validation
const environmentName = args[0];
if (environmentName === undefined || environmentName.trim() === '') {
  console.error("No environment name specified (e.g. dev)");
  console.error(`Usage: ${processName} (environment_name)`);
  process.exit(1);
} else if (environmentName === 'local') {
  console.error("Cannot deploy to local environment - API does not run in localstack. Just run it locally instead (e.g. 'npm start')");
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
const lambdaFunctionNames = terraformOutput['lambda_function_names'].value;

// Build project
exec('npm install && npm run build');

if (!fs.existsSync(buildDirectory)) {
  console.error("Cannot find build directory");
  process.exit(3);
}
// Copy package*.json files into build directory and enter
fs.copyFileSync('package.json', path.join(buildDirectory, 'package.json'));
fs.copyFileSync('package-lock.json', path.join(buildDirectory, 'package-lock.json'));
process.chdir(buildDirectory);

// Install node_modules needed by build
exec('npm ci --only production');
// Zip build artifact
exec(`zip -r '${zipFileName}' .`);

// Deploy build artifact to lambda functions
lambdaFunctionNames.forEach((functionName) => {
  console.log(`Deploying function: ${functionName}...`);
  const result = exec(`aws lambda update-function-code --function-name "${functionName}" --zip-file "fileb://${zipFileName}" --profile 'our-text-adventure'`, {
    stdio: 'pipe',
  });
  console.log("Finished deploying. Result:");
  console.log(result);
});

console.log(`Successfully deployed code to ${lambdaFunctionNames.length} lambda functions.`);

/**
 *
 * @param {string} command Command to exec
 * @param {import('child_process').ExecSyncOptionsWithStringEncoding} options
 */
function exec(command, options = {}) {
  return execSync(command, {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });
}
