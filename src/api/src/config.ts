import { LogLevel } from "./util/Logger";

const { ENVIRONMENT_ID, PROJECT_ID } = process.env;

export interface Config {
  screensTableName: string;
  environmentId: string;
  logLevel: LogLevel;
  awsEndpoint?: string;
}

// Environment variable validation
if (PROJECT_ID === undefined || PROJECT_ID.trim() === "") {
  throw new Error("Environment variable `PROJECT_ID` not set");
}
if (ENVIRONMENT_ID === undefined || ENVIRONMENT_ID.trim() === "") {
  throw new Error("Environment variable `ENVIRONMENT_ID` not set");
}

const baseConfig = {
  screensTableName: getScreensTableName(PROJECT_ID, ENVIRONMENT_ID),
  environmentId: ENVIRONMENT_ID,
};

let config: Config;
switch (ENVIRONMENT_ID) {
  case 'local':
    // Set dummy credentials for localstack
    process.env['AWS_ACCESS_KEY_ID'] = 'local';
    process.env['AWS_SECRET_ACCESS_KEY'] = 'local';

    config = {
      ...baseConfig,
      awsEndpoint: 'http://localhost:4581',
      logLevel: LogLevel.debug,
    };
    break;
  case 'docker':
    // Set dummy credentials for localstack
    process.env['AWS_ACCESS_KEY_ID'] = 'docker';
    process.env['AWS_SECRET_ACCESS_KEY'] = 'docker';

    config = {
      ...baseConfig,
      // @NOTE override docker table name to match `local` environment
      screensTableName: getScreensTableName(PROJECT_ID, 'local'),
      awsEndpoint: 'http://localstack:4581',
      logLevel: LogLevel.normal,
    };
    break;
  case 'dev':
    config = {
      ...baseConfig,
      logLevel: LogLevel.normal,
    };
    break;
  case 'test':
    config = {
      ...baseConfig,
      logLevel: LogLevel.none,
    };
    break;
  default:
    throw new Error("Unknown environment id: " + ENVIRONMENT_ID);
}

export default config;

function getScreensTableName(projectId: string, environmentId: string): string {
  return `${projectId}_${environmentId}_screens`;
}
