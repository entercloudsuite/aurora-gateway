import { StringUtils } from '../utils';

export class AppConfig {
  // required environment variables
  port: number;
  logLevel: string; // 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  serveStatic: boolean;
  sessionSecret: string;
  keystone_api_port: string;
  keystone_api_host: string;
  keystone_api_path: string;
  keystone_api_version: string;
  logstashHost: string;
  logstashPort: number;
  // optional environment variables
  enableHttpRequestLogging: boolean;

  constructor(private environment: any) {
    // required environment variables
    this.port = this.getIntegerEnvVar('PORT');
    this.logLevel = this.getStringEnvVar('LOG_LEVEL');
    this.serveStatic = this.getBooleanEnvVar('SERVE_STATIC');
    this.keystone_api_port = this.getStringEnvVar('KEYSTONE_API_PORT');
    this.keystone_api_path = this.getStringEnvVar('KEYSTONE_API_PATH');
    this.keystone_api_host = this.getStringEnvVar('KEYSTONE_API_HOST');
    this.keystone_api_version = this.getStringEnvVar('KEYSTONE_API_VERSION');
    this.sessionSecret = this.getStringEnvVar('SESSION_SECRET');
    // optional environment variables
    this.enableHttpRequestLogging = this.getBooleanEnvVar('ENABLE_HTTP_REQUEST_LOGGING', false);
    this.logstashPort = this.getIntegerEnvVar('LOGSTASH_PORT');
    this.logstashHost = this.getStringEnvVar('LOGSTASH_HOST');
  }

  getEnvironment(): any {
    return this.environment;
  }

  /////////////////////////

  private getBooleanEnvVar(variableName: string, defaultValue: boolean = null): boolean {
    const value = this.getEnvVar(variableName, defaultValue);

    const errorMessage =
        `Environment Variable ${variableName} does not contain a valid boolean`;

    return StringUtils.parseBoolean(value, errorMessage);
  }

  private getIntegerEnvVar(variableName: string, defaultValue: number = null): number {
    const value = this.getEnvVar(variableName, defaultValue);

    const errorMessage =
        `Environment Variable ${variableName} does not contain a valid integer`;

    return StringUtils.parseInt(value, errorMessage);
  }

  private getFloatEnvVar(variableName: string, defaultValue: number = null): number {
    const value = this.getEnvVar(variableName, defaultValue);

    const errorMessage =
        `Environment Variable ${variableName} does not contain a valid float`;

    return StringUtils.parseFloat(value, errorMessage);

  }

  private getStringEnvVar(variableName: string, defaultValue: string = null): string {
    return this.getEnvVar(variableName, defaultValue);
  }

  private getEnvVar(variableName: string, defaultValue: boolean | number | string): string {
    const value = this.environment[variableName] || defaultValue;

    if (value == null) {
      throw new Error(`Environment Variable ${variableName} must be set!`);
    }

    return value;
  }
}
