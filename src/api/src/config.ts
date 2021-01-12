import { LogLevel } from "./util/Logger";

const { ENVIRONMENT_ID, PROJECT_ID } = process.env;

export interface Config {
  screensTableName: string;
  environmentId: string;
  logLevel: LogLevel;
  awsEndpoint?: string;
}

const baseConfig = {
  // @NOTE defaults to "our-text-adventure" if not specified (e.g. when running locally)
  screensTableName: `${PROJECT_ID || 'our-text-adventure'}_${ENVIRONMENT_ID}_screens`,
  environmentId: ENVIRONMENT_ID!,
};

let config: Config;

switch (ENVIRONMENT_ID) {
  case 'local':
    process.env['AWS_PROFILE'] = 'our-text-adventure';

    config = {
      ...baseConfig,
      awsEndpoint: 'http://localhost:4566',
      logLevel: LogLevel.debug,
    };
    break;
  case 'docker':
    process.env['AWS_PROFILE'] = 'our-text-adventure';

    config = {
      ...baseConfig,
      awsEndpoint: 'http://localstack:4566',
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
    if (ENVIRONMENT_ID === undefined || ENVIRONMENT_ID.trim() === "") {
      throw new Error("Environment variable `ENVIRONMENT_ID` not set");
    } else {
      throw new Error("Unknown environment id: " + ENVIRONMENT_ID);
    }
}

export default config;
