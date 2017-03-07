import { Logger, LoggerFactory, InternalError, Request } from '../common';
import http = require('http');
import { ServiceUtils } from '../utils';

export class GatewayService {
  public serviceName: string;

  constructor(name: string) {
    this.serviceName = name;
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  static sendRequest(options): Promise<any> {
    const requestOptions = <Request> {
      protocol: 'http:' || options.protocol,
      host: options.host,
      port: options.port,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers
    };

    // options.headers['Content-Type'] = 'application/json';
    return ServiceUtils.sendRequest(requestOptions, options.body);
  };

  callServiceManager(): Promise<any> {
    return GatewayService.sendRequest({
      host: process.env.REGISTRY_IP,
      port: process.env.REGISTRY_PORT,
      path: '/service',
      headers: { 'Service-Name': this.serviceName }
    })
      .then(serviceManagerResponse => {
        return Promise.resolve(JSON.parse(serviceManagerResponse.body));
      });
  }
  
  callService(incomingRequest, serviceHost, servicePort, apiPath): Promise<any> {
    GatewayService.LOGGER.info(`Calling ${serviceHost}, on ${incomingRequest.path})}`);
    GatewayService.LOGGER.info(`Request headers - ${JSON.stringify(incomingRequest.headers)})}`);
    GatewayService.LOGGER.info(`Request body - ${JSON.stringify(incomingRequest.body)})}`);
    return GatewayService.sendRequest({
      host: serviceHost,
      port: servicePort,
      path: apiPath + incomingRequest.path,
      method: incomingRequest.method,
      headers: incomingRequest.headers,
      body: incomingRequest.body
    });
  }
}