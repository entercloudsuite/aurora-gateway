import { EventEmitter } from '../../common';
import { OpenstackAPIModel } from './openstack-api-model';

export class CinderService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'cinder';
    this.type = 'volume';
    EventEmitter.eventEmitter.on(
      EventEmitter.UPDATE_EVENTS.cinder,
      OpenstackAPIModel.update_endpoint
    );
  }

  callServiceApi(clientRequest: any): Promise<any> {
    clientRequest.url = '/' + clientRequest.headers['tenant-id'] + clientRequest.url;
    return super.callServiceApi(clientRequest);
  }
}