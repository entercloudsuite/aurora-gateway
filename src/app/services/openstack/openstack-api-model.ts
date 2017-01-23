import { OpenstackService } from './openstack-service';
import { OpenstackRequest } from '../../../@types_local/openstack-request';
import { ResourceNotFoundError, Logger, LoggerFactory } from '../../common';

import url = require('url');

export class OpenstackAPIModel {
  public name: string;
  public type: string;
  public endpoints_hash: {};
  public current_endpoint: {
    endpointId: string,
    port: string,
    path: string,
    host: string
  };

  public static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {
    this.current_endpoint = {};
    this.endpoints_hash = {};
  };

  static update_endpoint(newEndpoint: {}, serviceInstance: OpenstackAPIModel) {
    if (!(newEndpoint['id'] in serviceInstance.endpoints_hash)) {
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
      
      serviceInstance.endpoints_hash[newEndpoint['id']] = {
        adminUrl: newEndpoint['adminURL'],
        region: newEndpoint['region'],
        internalUrl: newEndpoint['internalURL'],
        publicUrl: newEndpoint['publicURL'],
        port: parsedUrl.port,
        host: parsedUrl.hostname,
        path: parsedUrl.path
      };

      OpenstackAPIModel.LOGGER.debug(
        `Saved endpoint for ${serviceInstance.name} - ${JSON.stringify(serviceInstance.endpoints_hash[newEndpoint['id']])}`
      );
    }
  }
  
  checkEndpointId(requestEndpointId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.current_endpoint.endpointId !== requestEndpointId) {
        if (this.endpoints_hash[requestEndpointId]) {
          this.current_endpoint = {
            endpointId: requestEndpointId,
            port: this.endpoints_hash[requestEndpointId].port,
            path: this.endpoints_hash[requestEndpointId].path,
            host: this.endpoints_hash[requestEndpointId].host
          };
          return resolve('Successfully updated current endpoint');
        } else {
          return reject(new ResourceNotFoundError());
        }
      } else {
        return resolve('Proceeding with current registered endpoint');
      }
    });
  }

  callServiceApi(clientRequest: any): Promise<any> {
    clientRequest.headers['x-auth-token'] = clientRequest.session.token;
    return OpenstackService.callOSApi(<OpenstackRequest> {
      host: this.current_endpoint.host,
      port: this.current_endpoint.port,
      path: this.current_endpoint.path + clientRequest.url,
      method: clientRequest.method,
      headers: clientRequest.headers,
      body: clientRequest.body
    });
  }
}