import { OpenstackAPIModel } from './openstack-api-model';
import { EventEmitter, RabbitClient } from '../common';

export class SwiftService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'swift';
    this.type = 'volume';
  }

  registerMessageHandlers() {
    EventEmitter.eventEmitter.on(EventEmitter.events.serviceCatalogUpdate.swift, SwiftService.updateEndpoint);
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

