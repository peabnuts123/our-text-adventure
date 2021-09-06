import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const LocalConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: `http://localhost:8000`, // @NOTE even though this is being hosted by docker, this URI is relative to the user's browser
  LogLevel: LogLevel.debug,
};

export default LocalConfig;
