import { EventEmitter } from '../../common';
import { OpenstackAPIModel } from './openstack-api-model';

export class SwiftService extends OpenstackAPIModel {
  constructor() {
    super();
    this.name = 'swift';
    this.type = 'volume';
    EventEmitter.eventEmitter.on(
      EventEmitter.UPDATE_EVENTS.swift,
      OpenstackAPIModel.update_endpoint
    );
  }
}