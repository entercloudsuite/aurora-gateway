import { OpenstackAPIModel } from './openstack-api-model';

export class NovaService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'nova';
    this.type = 'compute';
  }

  callServiceApi(clientRequest: any): Promise<any> {
    clientRequest.url = '/' + clientRequest.headers['tenant-id'] + clientRequest.url;
    return super.callServiceApi(clientRequest);
  }
}
