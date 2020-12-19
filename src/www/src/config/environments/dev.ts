import ApplicationConfig from "../Config";
import { LogLevel } from "@app/util/Logger";

const ProductionConfig: ApplicationConfig = {
  EnvironmentId: process.env.ENVIRONMENT_ID!,
  ApiHost: '', // Api on same domain
  LogLevel: LogLevel.none,
  AppVersion: process.env.PACKAGE_VERSION!,
};

export default ProductionConfig;
