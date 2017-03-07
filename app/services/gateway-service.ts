import { Logger, LoggerFactory, InternalError, Request } from '../common';
import { ServiceUtils } from '../utils';
import { APP_CONFIG } from '../config';
import http = require('http');

export class GatewayService {
  public serviceName: string;

  constructor(name: string) {
    this.serviceName = name;
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  /**
   * Wrapper for the sendRequest method from ServiceUtils
   * 
   * @static
   * @param {any} options 
   * @returns {Promise<any>} 
   * 
   * @memberOf GatewayService
   */
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

  /**
   * Calls Service Manager for information regarding the location of the requested service.
   * 
   * @returns {Promise<any>} 
   * 
   * @memberOf GatewayService
   */
  callServiceManager(): Promise<any> {
    return GatewayService.sendRequest({
      host: APP_CONFIG.serviceManagerHost,
      port: APP_CONFIG.serviceManagerPort,
      path: '/service',
      headers: { 'Service-Name': this.serviceName }
    })
      .then(serviceManagerResponse => {
        return Promise.resolve(JSON.parse(serviceManagerResponse.body));
      });
  }
  
  /**
   * 
   * @todo Remove apiPath constructor
   * @param {any} incomingRequest 
   * @param {any} serviceHost 
   * @param {any} servicePort 
   * @param {any} apiPath 
   * @returns {Promise<any>} 
   * 
   * @memberOf GatewayService
   */
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