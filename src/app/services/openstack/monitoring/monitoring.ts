import { Logger, LoggerFactory } from '../../../common';
import { Publisher } from '../../publisher';
import { EventEmitter } from '../../../common';

import events = require('events');
export class MonitoringService extends Publisher {
  private serviceName: string;
  private serviceEndpoints: {};

  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    super();
    this.serviceEndpoints = {};
  }

  static registerEvents(monitoringInstance: MonitoringService) {
    MonitoringService.LOGGER.debug('Adding listeners to monitoring service instance');
    
    EventEmitter.once('monitoringInstantiate', monitoringDetails => {
      MonitoringService.LOGGER.info('Updating Monitoring service');
      monitoringInstance.serviceName = monitoringDetails['name'];
      monitoringDetails['endpoints'].forEach(endpoint => {
        const endpointId = endpoint.id;
        delete endpoint.id;
        monitoringInstance.serviceEndpoints[endpointId] = endpoint;
      });
    });
    
    EventEmitter.on('registerMonitoringPlugin', pluginOptions => {
      MonitoringService.LOGGER.info('publishing new plugin');
      monitoringInstance.publishPlugin('recordUsage', pluginOptions);
    });
  }
  
  publishPlugin(type: string, options: {}): Promise<any> {
    return this.publishMessage(this.monitoringExchangeName, type, 'monitoring', options);
  }
}