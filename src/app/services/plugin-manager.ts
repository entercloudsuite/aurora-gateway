import { Logger, LoggerFactory, InvalidJsonError} from '../common';
import { EventEmitter } from '../common';

export class PluginManager {
  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    
  }

  registerPlugin(type: string, options: any, pluginId?: string): Promise<any> {
    PluginManager.LOGGER.debug(`Registering new plugin with options - ${JSON.stringify(options)}`)
    return new Promise((resolve, reject) => {
      switch (options.action) {
        case 'measure':
          EventEmitter.eventEmitter.emit(
            EventEmitter.REGISTER_EVENTS.monitoringPlugin,
            type,
            options
          );
          return resolve('Plugin request validated');
          break;
        default:
          return reject(new InvalidJsonError(`Invalid action name - ${options.action}`));
      }
    });
  }
  
  listPlugins(): Promise<any> {
    return new Promise((resolve, reject) => {
      return resolve('Test method');
    });
  }
}