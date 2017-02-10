import { OpenstackAPIModel } from './openstack-api-model';

export class SwiftService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'swift';
    this.type = 'volume';
  }
}