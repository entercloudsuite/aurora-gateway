import events = require('events');
import { Logger, LoggerFactory } from '../common';
import { OpenstackAPIModel } from '../services/';

class APIEvents {
  public eventEmitter: events.EventEmitter;
  public serviceInstances: OpenstackAPIModel;

  public UPDATE_SERVICE_ID: string
  public NEW_SERVICE_CATALOG: string;

  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.eventEmitter = new events.EventEmitter();
    this.UPDATE_SERVICE_ID = 'UPDATE_SERVICE_ID';
    this.NEW_SERVICE_CATALOG = 'NEW_SERVICE_CATALOG';
  }
}
export let EventEmitter = new APIEvents();