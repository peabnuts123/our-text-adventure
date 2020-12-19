import ApplicationConfig from "../Config";
import { LogLevel } from "@app/util/Logger";

const DevelopmentConfig: ApplicationConfig = {
  EnvironmentId: "Local",
  ApiHost: `http://localhost:8000`,
  LogLevel: LogLevel.debug,
  AppVersion: process.env.PACKAGE_VERSION!,
};

export default DevelopmentConfig;
