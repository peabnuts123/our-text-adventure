import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const ProductionConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: '', // Api on same domain
  LogLevel: LogLevel.none,
};

export default ProductionConfig;
