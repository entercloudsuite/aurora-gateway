import { Logger, LoggerFactory } from '../common';

export class PluginManager {
  private registeredPlugins: {};
  private externalWorkers: {};

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  constructor(workersInfo: {}) {
    PluginManager.LOGGER.info('Initializing Plugin Manager');
    this.externalWorkers = workersInfo;
  }

  registerWorker() {

  }

  registerPlugin() {

  }
}