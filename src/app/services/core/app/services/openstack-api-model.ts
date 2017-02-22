import { OpenstackService } from './openstack-service';
import { ResourceNotFoundError, Logger, LoggerFactory } from '../common';

import url = require('url');

export class OpenstackAPIModel {
  public name: string;
  public type: string;
  public endpoints: {};

  public static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.endpoints = {};
  };

  static updateEndpoint(newEndpoint: {}, serviceInstance: OpenstackAPIModel) {
    if (!(newEndpoint['id'] in serviceInstance.endpoints)) {
      // Remove tenant id from urls on nova and cinder
      if (newEndpoint['publicURL'].split('/').length === 5) {
        newEndpoint['adminURL'] = newEndpoint['adminURL'].substr(0, newEndpoint['adminURL'].lastIndexOf('/'));
        newEndpoint['internalURL'] = newEndpoint['internalURL'].substr(0, newEndpoint['internalURL'].lastIndexOf('/'));
        newEndpoint['publicURL'] = newEndpoint['publicURL'].substr(0, newEndpoint['publicURL'].lastIndexOf('/'));
      }

      const parsedUrl = url.parse(newEndpoint['publicURL']);
      if (parsedUrl.path === '/') {
        parsedUrl.path = '';
      }
      
      serviceInstance.endpoints[newEndpoint['id']] = {
        adminUrl: newEndpoint['adminURL'],
        region: newEndpoint['region'],
        internalUrl: newEndpoint['internalURL'],
        publicUrl: newEndpoint['publicURL'],
        port: parsedUrl.port,
        host: parsedUrl.hostname,
        path: parsedUrl.path
      };

      OpenstackAPIModel.LOGGER.debug(
        `Saved endpoint for ${serviceInstance.name} - ${JSON.stringify(serviceInstance.endpoints[newEndpoint['id']])}`
      );
    }
  }

  checkEndpointId(requestEndpointId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.endpoints[requestEndpointId]) {
        return resolve({
          endpointId: requestEndpointId,
          port: this.endpoints[requestEndpointId].port,
          path: this.endpoints[requestEndpointId].path,
          host: this.endpoints[requestEndpointId].host
        });
      } else {
        return reject(new ResourceNotFoundError(`Specified endpoint ID could not be found`));
      }
    });
  }
  
  callServiceApi(endpointId: string, method: string, path: string, headers: {}, body: {}): Promise<any> {
    const requestOptions = {
      protocol: 'http:',
      host: this.endpoints[endpointId].host,
      port: this.endpoints[endpointId].port,
      path: this.endpoints[endpointId].path + path,
      method: method,
      headers: headers,
    };
    
    return OpenstackService.callOSApi(requestOptions, body);
  }
}