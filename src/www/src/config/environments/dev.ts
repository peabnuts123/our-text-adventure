import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const DevConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: '', // Api on same domain
  LogLevel: LogLevel.none,
};

export default DevConfig;
