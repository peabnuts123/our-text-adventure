import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const TestConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: 'http://mock-domain', // Network requests should fail
  LogLevel: LogLevel.none,
};

export default TestConfig;
