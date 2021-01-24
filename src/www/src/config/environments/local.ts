import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const LocalConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: `http://localhost:8000`,
  LogLevel: LogLevel.debug,
};

export default LocalConfig;
