import { OpenstackAPIModel } from './openstack-api-model';
import { EventEmitter, RabbitClient } from '../common';

export class NovaService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'nova';
    this.type = 'compute'; }

  registerMessageHandlers() {
    EventEmitter.eventEmitter.on(EventEmitter.events.serviceCatalogUpdate.nova, NovaService.updateEndpoint);
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
