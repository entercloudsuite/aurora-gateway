import { Publisher, EventEmitter, Logger, LoggerFactory } from '../../common';
import { OpenstackAPIModel } from './openstack-api-model';

export class MonitoringService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'ceilometer';
    this.type = 'monitoring';
    EventEmitter.eventEmitter.on(
      EventEmitter.UPDATE_EVENTS.monitoring,
      OpenstackAPIModel.update_endpoint
    );
    EventEmitter.eventEmitter.on(
      EventEmitter.REGISTER_EVENTS.monitoringPlugin,
      MonitoringService.publishPlugin
    );
  }

  static publishPlugin(type: string, options: {}): Promise<any> {
    OpenstackAPIModel.LOGGER.info(`Registering plugin for - ${options}`);
    return Publisher.publishMessage(Publisher.monitoringExchangeName, type, 'monitoring', options);
  }
}