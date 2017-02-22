import { OpenstackAPIModel } from './openstack-api-model';
import { EventEmitter, RabbitClient } from '../common';

export class CinderService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'cinder';
    this.type = 'volume';
  }

  registerMessageHandlers() {
    EventEmitter.eventEmitter.on(EventEmitter.events.serviceCatalogUpdate.cinder, CinderService.updateEndpoint);
  }
  
  callServiceApi(clientRequest: any): Promise<any> {
    return super.callServiceApi(
      clientRequest.headers['endpoint-id'],
      clientRequest.method,
      '/' + clientRequest.headers['tenant-id'] + clientRequest.url,
      clientRequest.headers,
      clientRequest.body
    );
  }
}