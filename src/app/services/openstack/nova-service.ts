import { EventEmitter } from '../../common';
import { OpenstackAPIModel } from './openstack-api-model';

export class NovaService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'nova';
    this.type = 'compute';
    EventEmitter.eventEmitter.on(
      EventEmitter.UPDATE_EVENTS.nova,
      OpenstackAPIModel.update_endpoint
    );
  }

  callServiceApi(clientRequest: any): Promise<any> {
    clientRequest.url = '/' + clientRequest.headers['tenant-id'] + clientRequest.url;
    return super.callServiceApi(clientRequest);
  }
}