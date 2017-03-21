import { Logger, LoggerFactory } from '../common';

export class AppConfig {
  // required environment variables
  port: number;
  logLevel: string; // 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  serveStatic: boolean;
  sessionSecret: string;
  serviceManagerHost: string;
  serviceManagerPort: number;
  topologyFile: string;
  rabbitUser: string;
  rabbitUserPassword: string;
  rabbitPort: number;
  rabbitHost: string;
  // optional environment variables
  redisPort: number;
  redisHost: string;
  enableHttpRequestLogging: boolean;

  public static LOGGER: Logger = LoggerFactory.getLogger();

  constructor(private environment: any) {
    // required environment variables 
    this.port = this.getIntegerEnvVar('PORT');
    this.logLevel = this.getStringEnvVar('LOG_LEVEL');
    this.serveStatic = this.getBooleanEnvVar('SERVE_STATIC');
    this.sessionSecret = this.getStringEnvVar('SESSION_SECRET');
    this.serviceManagerHost = this.getStringEnvVar('SERVICE_MANAGER_HOST');
    this.serviceManagerPort = this.getIntegerEnvVar('SERVICE_MANAGER_PORT');
    this.topologyFile = this.getStringEnvVar('TOPOLOGY_FILE_PATH');
    this.rabbitUser = this.getStringEnvVar('RABBIT_USER');
    this.rabbitUserPassword = this.getStringEnvVar('RABBIT_PASS');
    this.rabbitPort = this.getIntegerEnvVar('RABBIT_PORT');
    this.rabbitHost = this.getStringEnvVar('RABBIT_HOST');
    // optional environment variables
    this.redisPort = this.getIntegerEnvVar('REDIS_PORT', 6379);
    this.redisHost = this.getStringEnvVar('REDIS_HOST', '127.0.0.1');
    this.enableHttpRequestLogging = this.getBooleanEnvVar('ENABLE_HTTP_REQUEST_LOGGING', false);

    AppConfig.LOGGER.debug(`App config - ${JSON.stringify(this.toJSON())}`);
  }

  getEnvironment(): any {
    return this.environment;
  }

  private getBooleanEnvVar(variableName: string, defaultValue: boolean = null): boolean {
    const boolVar = this.getEnvVar(variableName, defaultValue);
    if ( boolVar === 'true' || boolVar === 'false') {
      return true;
    } else {
      throw new Error(`Environment Variable ${variableName} does not contain a valid boolean`);
    }
  }

  private getIntegerEnvVar(variableName: string, defaultValue: number = null): number {
    const parsedResult = parseInt(this.getEnvVar(variableName, defaultValue));

    if (!parsedResult) {
      throw new Error(`Environment Variable ${variableName} does not contain a valid integer`);
    } else {
      return parsedResult;
    }
  }

  private getFloatEnvVar(variableName: string, defaultValue: number = null): number {
    const parsedResult = parseFloat(this.getEnvVar(variableName, defaultValue));

    if (!parsedResult) {
      throw new Error(`Environment Variable ${variableName} does not contain a valid float`);
    } else {
      return parsedResult;
    }
  }

  private getStringEnvVar(variableName: string, defaultValue: string = null): string {
    return this.getEnvVar(variableName, defaultValue);
  }

  private getEnvVar(variableName: string, defaultValue: boolean | number | string): string {
    const value = process.env[variableName] || defaultValue;

    if (value == null) {
      throw new Error(`Environment Variable ${variableName} must be set!`);
    }

    return value;
  }

  public toJSON() {
    return {
      port: this.port,
      logLevel: this.logLevel,
      serveStatic: this.serveStatic,
      sessionSecret: this.sessionSecret,
      serviceManagerHost: this.serviceManagerHost,
      serviceManagerPort: this.serviceManagerPort,
      topologyFile: this.topologyFile,
      rabbitUser: this.rabbitUser,
      rabbitUserPassword: this.rabbitUserPassword,
      rabbitPort: this.rabbitPort,
      rabbitHost: this.rabbitHost,
      redisPort: this.redisPort,
      redisHost: this.redisHost,
      enableHttpRequestLogging: this.enableHttpRequestLogging
    };
  }
}

export const APP_CONFIG = new AppConfig(process.env.ENV);