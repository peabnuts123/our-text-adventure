#!/usr/bin/env node
/* eslint-disable no-console */

const { _: args, '$0': processName } = require('yargs').argv;
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');
const fs = require('fs');
const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const archiver = require('archiver');

// Config
const buildDirectory = 'build';

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
/** @type {string} */
const awsRegion = terraformOutput['aws_region'].value;
/** @type {Record<string, Record<string,string>>} */
const allLambdaFunctions = terraformOutput['all_lambda_functions'].value;

// Build project
exec('npm install && npm run build');

if (!fs.existsSync(buildDirectory)) {
  console.error("Cannot find build directory");
  process.exit(3);
}
// Enter the build directory
process.chdir(buildDirectory);

void (async () => {
  const lambdaClient = new LambdaClient({
    region: awsRegion,
  });

  // Deploy lambda functions
  const startTimeAll = performance.now();
  for (const lambdaFunctionId in allLambdaFunctions) {
    // 0. Get metadata from Terraform output
    const lambdaFunction = allLambdaFunctions[lambdaFunctionId];
    const functionName = lambdaFunction.name;
    const handlerRoot = lambdaFunction.handler.replace(/\.\w+$/, '');

    // 1. Archive Handler's code into zip file
    const archiveName = `handler_${lambdaFunctionId}.zip`;
    console.log(`Creating archive: ${archiveName}...`);
    await createZipArchive(archiveName, `${handlerRoot}/*`);


    // 2. Deploy handler's code archive
    console.log(`Deploying function: ${functionName}...`);
    const startTime = performance.now();

    const response = await lambdaClient.send(new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile: fs.readFileSync(archiveName),
    }));
    const endTime = performance.now();

    console.log(JSON.stringify(response, null, 2));
    console.log(`Finished deploying function '${functionName}' after ${((endTime - startTime) / 1000).toFixed(1)}s`);
  }
  const endTimeAll = performance.now();

  console.log(`Finished deploying code to ${Object.keys(allLambdaFunctions).length} lambda functions after ${((endTimeAll - startTimeAll) / 1000).toFixed(1)}s`);
})();


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

async function createZipArchive(outputFile, filesGlob) {
  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  archive.pipe(output);

  // Throw errors
  archive.on('error', function (err) {
    throw err;
  });

  // Add files to archive
  archive.glob(filesGlob);

  // Write archive
  await archive.finalize();

  await new Promise((resolve) => setTimeout(resolve, 1000));
}
