import events = require('events');
import { Logger, LoggerFactory } from '../common';
import { OpenstackAPIModel } from '../services/';

class APIEvents {
  public eventEmitter: events.EventEmitter;
  public serviceInstances: {
    nova: OpenstackAPIModel,
    neutron: OpenstackAPIModel,
    glance: OpenstackAPIModel,
    cinder: OpenstackAPIModel,
    keystone: OpenstackAPIModel,
    monitoring: OpenstackAPIModel,
    swift: OpenstackAPIModel
  };
  public UPDATE_EVENTS: {
    nova: string,
    cinder: string,
    glance: string,
    keystone: string,
    neutron: string,
    monitoring: string,
    swift: string
  };
  public REGISTER_EVENTS: {
    monitoringPlugin: string
  };
  public NEW_SERVICE_CATALOG: string;

  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.eventEmitter = new events.EventEmitter();
    this.UPDATE_EVENTS = {
      nova: 'update_nova',
      cinder: 'update_cinder',
      glance: 'update_glance',
      keystone: 'update_keystone',
      neutron: 'update_neutron',
      monitoring: 'update_monitoring',
      swift: 'update_swift'
    };

    this.REGISTER_EVENTS = {
      monitoringPlugin: 'register_monitoring_plugin'
    };
    
    this.NEW_SERVICE_CATALOG = 'new_service_catalog';
  }

  emitUpdateEvent(serviceName: string, endpoint: {}) {
    let UPDATE_EVENT: string;
    let serviceInstance: OpenstackAPIModel;
    
    switch (serviceName) {
      case 'nova':
        UPDATE_EVENT = this.UPDATE_EVENTS.nova;
        serviceInstance = this.serviceInstances.nova;
        break;
      case 'cinder':
        UPDATE_EVENT = this.UPDATE_EVENTS.cinder;
        serviceInstance = this.serviceInstances.cinder;
        break;
      case 'cinderv2':
        UPDATE_EVENT = this.UPDATE_EVENTS.cinder;
        serviceInstance = this.serviceInstances.cinder;
        break;
      case 'neutron':
        UPDATE_EVENT = this.UPDATE_EVENTS.neutron;
        serviceInstance = this.serviceInstances.neutron;
        break;
      case 'ceilometer':
        UPDATE_EVENT = this.UPDATE_EVENTS.monitoring;
        serviceInstance = this.serviceInstances.monitoring;
        break;
      case 'glance':
        UPDATE_EVENT = this.UPDATE_EVENTS.glance;
        serviceInstance = this.serviceInstances.glance;
        break;
      case 'keystone':
        UPDATE_EVENT = this.UPDATE_EVENTS.keystone;
        serviceInstance = this.serviceInstances.keystone;
        break;
      case 'swift':
        UPDATE_EVENT = this.UPDATE_EVENTS.swift;
        serviceInstance = this.serviceInstances.swift;
        break;
      default:
        APIEvents.LOGGER.error(`Service type not supported - ${serviceName}`);
    }

    this.eventEmitter.emit(UPDATE_EVENT, endpoint, serviceInstance);
  }
}

export let EventEmitter = new APIEvents();