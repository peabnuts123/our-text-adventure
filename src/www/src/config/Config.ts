import { LogLevel } from "@app/util/Logger";

interface ApplicationConfig {
  // @TODO put EnvironmentId/AppVersion into <head>
  readonly EnvironmentId: string;
  readonly ApiHost: string;
  readonly LogLevel: LogLevel;
  readonly AppVersion: string;
}

export default ApplicationConfig;
