import { EventEmitter } from '../../common';
import { OpenstackAPIModel } from './openstack-api-model';

export class NeutronService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'neutron';
    this.type = 'network';
    EventEmitter.eventEmitter.on(
      EventEmitter.UPDATE_EVENTS.neutron,
      OpenstackAPIModel.update_endpoint
    );
  }
}