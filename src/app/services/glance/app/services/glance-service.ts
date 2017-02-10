import { OpenstackAPIModel } from './openstack-api-model';

export class GlanceService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'glance';
    this.type = 'image';
    // Emit create event
  }
}