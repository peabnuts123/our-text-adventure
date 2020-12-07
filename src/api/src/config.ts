import { LogLevel } from "./util/Logger";

const { ENVIRONMENT_ID } = process.env;

export interface Config {
  useLocalstack: boolean;
  screensTableName: string;
  environmentId: string;
  logLevel: LogLevel;
}

const baseConfig = {
  screensTableName: 'AdventureScreens',
  environmentId: ENVIRONMENT_ID!,
};

let config: Config;

switch (ENVIRONMENT_ID) {
  case 'local':
    process.env['AWS_PROFILE'] = 'our-text-adventure';

    config = {
      ...baseConfig,
      useLocalstack: true,
      logLevel: LogLevel.debug,
    };
    break;
  case 'dev':
    config = {
      ...baseConfig,
      useLocalstack: false,
      logLevel: LogLevel.normal,
    };
    break;
  case 'test':
    config = {
      ...baseConfig,
      useLocalstack: false,
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
