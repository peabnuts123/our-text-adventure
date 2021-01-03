import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const DevelopmentConfig: ApplicationConfig = {
  ...GlobalConfig,
  // ApiHost: `http://localhost:8000`,
  ApiHost: `https://ee4be702e624.au.ngrok.io`,
  LogLevel: LogLevel.debug,
};

export default DevelopmentConfig;
