import http = require('http');
import request = require('request');
import {Logger, LoggerFactory, InternalError, ApiError, InvalidJsonError, ResourceNotFoundError} from '../../common';
import util = require('util');
import events = require('events');
import { EventEmitter } from '../../common';

export class OpenstackService {
  public authUrl: string;
  private region: string;
  public serviceCatalog: {};
  public apiVersion: string;
  
  private static readonly LOGGER: Logger = LoggerFactory.getLogger();

  constructor(options: {}) {
    OpenstackService.LOGGER.info('Instatiating OpenstackService');
    this.authUrl = options['uri'];
    this.apiVersion = options['version'];
    this.serviceCatalog = {};
    OpenstackService.LOGGER.info(`OpenStack API Version - ${this.apiVersion}`);
    OpenstackService.LOGGER.info(`Keystone URL - ${this.authUrl}`);
    OpenstackService.sendRequest({'uri': this.authUrl})
      .then((result) => {
        if (result.statusCode !== 200) {
          OpenstackService.LOGGER.error('Unable to reach Openstack API on specified endpoint');
          throw new ApiError('Error while testing Openstack API connection', result.statusCode, "OPENSTACK_API_ERROR")
        }
        OpenstackService.LOGGER.info('Validated API connection - Response body:');
        OpenstackService.LOGGER.debug(result.body);
      })
      .catch((error) => {
        OpenstackService.LOGGER.error('Error while testing OpenStack API');
        throw new InternalError(error);
      });
  }

  updateServiceCatalog(newServiceCatalog: Array<{}>) {
    // TODO: Add method desciption with hash map structure
    newServiceCatalog.forEach((item) => {
      item['endpoints'].forEach((endpoint) => {
        if (!(endpoint['id'] in this.serviceCatalog)) {
          if (item['name'] === 'ceilometer') {
            EventEmitter.emit('monitoringInstantiate', item);
          }

          // Remove tenant id from urls on nova and cinder
          if (item['name'].includes('cinder') || item['name'].includes('nova')) {
            endpoint['adminURL'] = endpoint['adminURL'].substr(0, endpoint['adminURL'].lastIndexOf('/'));
            endpoint['internalURL'] = endpoint['internalURL'].substr(0, endpoint['internalURL'].lastIndexOf('/'));
            endpoint['publicURL'] = endpoint['publicURL'].substr(0, endpoint['publicURL'].lastIndexOf('/'));
          }

          this.serviceCatalog[endpoint['id']] = {
            'adminURL': endpoint['adminURL'],
            'region': endpoint['region'],
            'internalURL': endpoint['internalURL'],
            'publicURL': endpoint['publicURL'],
            'type': item['type'],
            'name': item['name']
          };
        }
      });
    });

    OpenstackService.LOGGER.info(`Service Catalog: ${JSON.stringify(this.serviceCatalog)}`);
  }

  proxyRequest(initialRequest: any): Promise<any> {
    initialRequest.headers['x-auth-token'] = initialRequest.session.token;
    if (initialRequest.headers['tenant-id']) {
      initialRequest.url = '/' + initialRequest.headers['tenant-id'] + initialRequest.url;
    }
    OpenstackService.LOGGER.debug(`Proxy request headers -  ${JSON.stringify(initialRequest.headers)}`);
    OpenstackService.LOGGER.debug(`Proxy request body -  ${JSON.stringify(initialRequest.body)}`);
    return OpenstackService.sendRequest({
      'method': initialRequest.method,
      'uri': this.serviceCatalog[initialRequest.headers['endpoint-id']].publicURL + initialRequest.url,
      'headers': initialRequest.headers,
      'body': initialRequest.body
    });
  }
  
  getServiceCatalog(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.serviceCatalog) {
        return resolve(this.serviceCatalog);
      } else {
        return reject(new ResourceNotFoundError());
      }
    });
  }
  
  static  sendRequest(options: {}): Promise<any> {
    let requestOptions = {
      'method': options['method'] || 'GET',
      'uri': options['uri'],
      'json': options['json'] || true,
      'headers': options['headers'] || {'content-type': 'application/json'},
      'forever': true
    };

    if (options['body']) {
      requestOptions['body'] = options['body'];
    }

    OpenstackService.LOGGER.debug(`Calling OpenStack API with ${JSON.stringify(requestOptions)}`);
    return new Promise((resolve, reject) => {
      request(requestOptions, (err, response, body) => {
        if (err) {
          return reject(new InternalError(err));
        }
        OpenstackService.LOGGER.info(`OpenStack API Response - ${JSON.stringify(response.body)}`);
        if (body['error']) {
          return reject(new ApiError(body.error.message, body.error.code, body.error.title));
        } else {
          return resolve(response);
        }
      });
    });
  };

  static parseCredentials(credentials: {}, apiVersion: string): Promise<any> {
    OpenstackService.LOGGER.debug(`Parsing credentials - ${JSON.stringify(credentials)}`);
    return new Promise((resolve, reject) => {
      switch (apiVersion) {
        case '2.0':
          if (credentials['username'] && credentials['password']) {
            return resolve({
              'auth': {
                'tenantName': credentials['tenant'] || '',
                'passwordCredentials': {
                  'username': credentials['username'],
                  'password': credentials['password']
                }
              }
            });
            // TODO: Add InvalidCredentialsError
          } else return reject(new InvalidJsonError());
        default:
          // TODO: Handle exceptions
          return resolve(credentials);
      }
    });
  }
}

