import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const DevelopmentConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: `http://localhost:8000`,
  LogLevel: LogLevel.debug,
};

export default DevelopmentConfig;
