import { Logger, LoggerFactory, RabbitClient, Stack, ResourceNotFoundError } from '../common';
import { ServiceModel } from '../models';
import objectHash = require('object-hash');
import http = require('http');
import { Topology } from '../config';

export class ServiceManager {
  public serviceTable: {};
  private serviceStacks: {};
  private lastUsedService: {};
  private rabbitClient: RabbitClient;
  
  private static LOGGER: Logger = LoggerFactory.getLogger();
  
  constructor() {
    this.serviceTable = {};
    this.serviceStacks = {};
    this.lastUsedService = {};
    this.rabbitClient = new RabbitClient(Topology.EXCHANGES.generalExchange, Topology.QUEUES.general);
    this.registerHandlers();
  }

  registerService(serviceOptions: {}): Promise<any> {
    ServiceManager.LOGGER.info(`Registering new service - ${JSON.stringify(serviceOptions)}`);
    const newService = new ServiceModel(
      serviceOptions.host, serviceOptions.port, serviceOptions.name,
      serviceOptions.status, serviceOptions.routingPath, serviceOptions.apiPath
    );
    
    const serviceId = objectHash(newService);
    this.serviceTable[serviceId] = newService;

    if (!this.serviceStacks[newService.name]) {
      // this.generalQueue.publishMessage(
      //   this.generalQueue.generalExchange,
      //   this.generalQueue.messageTypes.NEW_SERVICE,
      //   '',
      //   serviceOptions
      // );
      this.notifyGateway(newService);
    }

    if (serviceOptions.status === 'READY') {
      this.updateStack(serviceOptions.name, serviceId);
    }

    return Promise.resolve(serviceId);
  }

  registerHandlers() {
    ServiceManager.updateStatus.bind(this);
    
    this.rabbitClient.rabbitConnection.handle(
      Topology.MESSAGES.newService,
      ServiceManager.updateStatus
    );
  }

  notifyGateway(newService) {
    const requestBody = JSON.stringify({
      host: newService.host,
      routingPath: newService.routingPath,
      name: newService.name
    });

    const requestOptions = {
      protocol: 'http:',
      host: '127.0.0.1',
      port: '3000',
      path: '/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
    
    ServiceManager.LOGGER.debug(`Calling gateway on new service - ${JSON.stringify(newService)}`);;
    let responseBody = '';
    const gatewayRequest = http.request(requestOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        ServiceManager.LOGGER.debug(`Response body - ${chunk}`);
        responseBody += chunk;
      });

      res.on('end', () => {
        res['body'] = responseBody;
        ServiceManager.LOGGER.debug(`Gatewawy response - ${responseBody}`);
      });
    });

    gatewayRequest.on('error', (requestError) => {
      ServiceManager.LOGGER.error(`Request error - ${JSON.stringify(requestError)}`);
    });

    gatewayRequest.write(requestBody);


    gatewayRequest.end();
  }

  static updateStatus(message: any) {
    ServiceManager.LOGGER.debug(`New service status - ${message.body.status} - from - ${message.body.name}`);
    if (message.body.status === 'READY') {
      this.updateStack(this.serviceTable[message.body.id].name, message.body.id);
    } else if (message.body.status === 'HEARTBEAT') {
       this.serviceTable[message.body.id].lastUpdate = Date.now();
    }
  }

  updateStack(serviceName: string, serviceId: string) {
    ServiceManager.LOGGER.debug(`Updating stack ${serviceName} with ${serviceId}`);
    if (!(serviceName in Object.keys(this.serviceStacks))) {
      this.serviceStacks[serviceName] = new Stack();
    }

    this.serviceStacks[serviceName].push(serviceId);
  }
  
  getAvailableService(serviceName: string): Promise<any> {
    ServiceManager.LOGGER.debug(`Listing available service for - ${serviceName}`);
    let serviceId = '';
    if (!this.serviceStacks[serviceName].isEmpty()) {
      serviceId = this.serviceStacks[serviceName].update();
    } else {
      return Promise.reject(new ResourceNotFoundError());
    }
    
    return Promise.resolve(this.serviceTable[serviceId].toJSON());
  }
}