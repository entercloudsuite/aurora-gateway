import { OpenstackAPIModel } from './openstack-api-model';
import { EventEmitter, RabbitClient } from '../common';


export class GlanceService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'glance';
    this.type = 'image';
  }

  registerMessageHandlers() {
    EventEmitter.eventEmitter.on(EventEmitter.events.serviceCatalogUpdate.glance, GlanceService.updateEndpoint);
  }

  callServiceApi(clientRequest: any): Promise<any> {
    return super.callServiceApi(
      clientRequest.headers['endpoint-id'],
      clientRequest.method,
      clientRequest.url,
      clientRequest.headers,
      clientRequest.body
    );
  }
}