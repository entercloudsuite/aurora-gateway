import { OpenstackAPIModel } from './openstack-api-model';

export class NeutronService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'neutron';
    this.type = 'network';
  }
}