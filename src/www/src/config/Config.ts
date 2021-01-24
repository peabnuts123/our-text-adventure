import { LogLevel } from "@app/util/Logger";

export interface ApplicationConfig {
  readonly EnvironmentId: string;
  readonly ApiHost: string;
  readonly LogLevel: LogLevel;
  readonly AppVersion: string;
}

export const GlobalConfig = {
  EnvironmentId: process.env.ENVIRONMENT_ID!,
  AppVersion: process.env.PACKAGE_VERSION!,
};
