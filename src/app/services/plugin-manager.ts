import { Logger, LoggerFactory, InvalidJsonError} from '../common';
import events = require('events');
import { EventEmitter } from '../common';

export class PluginManager {
  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
  }

  registerPlugin(options: any): Promise<any> {
    PluginManager.LOGGER.debug(`Registering new plugin with options - ${JSON.stringify(options)}`)
    return new Promise((resolve, reject) => {
      switch (options.action) {
        case 'measure':
          EventEmitter.emit('registerMonitoringPlugin', options);
          return resolve('Plugin request validated');
          break;
        default:
          return reject(new InvalidJsonError(`Invalid action name - ${options.action}`));
      }
    });
  }
}