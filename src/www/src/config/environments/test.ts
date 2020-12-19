import ApplicationConfig from "../Config";
import { LogLevel } from "@app/util/Logger";

const TestConfig: ApplicationConfig = {
  EnvironmentId: process.env.ENVIRONMENT_ID!,
  ApiHost: 'http://mock-domain', // Network requests should fail
  LogLevel: LogLevel.none,
  AppVersion: process.env.PACKAGE_VERSION!,
};

export default TestConfig;
