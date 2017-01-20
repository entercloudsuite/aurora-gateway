import http = require('http');
import request = require('request');
import { Logger, LoggerFactory, InternalError, ApiError, InvalidJsonError, ResourceNotFoundError } from '../../common';
import util = require('util');
import url = require('url');
import events = require('events');
import { EventEmitter } from '../../common';
import { OpenstackRequest } from '../../../@types_local/openstack-request';

export class OpenstackService {
  public keystoneApiHost: string;
  public keystoneApiPort: string;
  public keystoneApiPath: string;
  public serviceCatalog: {};
  public keystoneApiVersion: string;
  
  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor(options: {}) {
    OpenstackService.LOGGER.info('Instatiating OpenstackService');
    this.keystoneApiHost = options.host;
    this.keystoneApiPort = options.port;
    this.keystoneApiPath = options.path;
    this.keystoneApiVersion = options.version;
    this.serviceCatalog = {};
    
    OpenstackService.sendRequest(<OpenstackRequest> {
      host: this.keystoneApiHost,
      port: this.keystoneApiPort,
      path: this.keystoneApiPath
    })
      .then((result) => {
        if (result.statusCode !== 200) {
          OpenstackService.LOGGER.error('Unable to reach Openstack API on specified endpoint');
          throw new ApiError('Error while testing Openstack API connection', result.statusCode, "OPENSTACK_API_ERROR")
        }
        OpenstackService.LOGGER.info('Validated API connection - Response body:');
        OpenstackService.LOGGER.debug(result.body);
      })
      .catch((error) => {
        OpenstackService.LOGGER.error('Error while testing Keystone connection');
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

          let publicUrl = url.parse(endpoint['publicURL']);
          let urlObj = {
            port: publicUrl.port,
            host: publicUrl.hostname,
            path: publicUrl.path
          };

          this.serviceCatalog[endpoint['id']] = {
            adminURL: endpoint['adminURL'],
            region: endpoint['region'],
            internalURL: endpoint['internalURL'],
            publicURL: endpoint['publicURL'],
            type: item['type'],
            name: item['name'],
            url: urlObj
          };
        }
      });
    });

    OpenstackService.LOGGER.info(`Service Catalog: ${JSON.stringify(this.serviceCatalog)}`);
  }

  proxyRequest(initialRequest: OpenstackRequest): Promise<any> {
    initialRequest.headers['x-auth-token'] = initialRequest.session.token;
    if (initialRequest.headers['tenant-id']) {
      initialRequest.url = '/' + initialRequest.headers['tenant-id'] + initialRequest.url;
    }
    OpenstackService.LOGGER.debug(`Proxy request headers -  ${JSON.stringify(initialRequest.headers)}`);
    OpenstackService.LOGGER.debug(`Proxy request body -  ${JSON.stringify(initialRequest.body)}`);
    return OpenstackService.sendRequest( <OpenstackRequest> {
      method: initialRequest.method,
      host: this.serviceCatalog[initialRequest.headers['endpoint-id']].url.host,
      port: this.serviceCatalog[initialRequest.headers['endpoint-id']].url.port,
      path: this.serviceCatalog[initialRequest.headers['endpoint-id']].url.path + initialRequest.url,
      headers: initialRequest.headers,
      body: initialRequest.body
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
  
  static  sendRequest(options: OpenstackRequest): Promise<any> {
    let requestBody = '';
    let requestOptions = {
      protocol: 'http:' || options.protocol,
      host: options.host,
      port: options.port,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    requestOptions.headers['Content-Type'] = 'application/json';
    if (options.body) {
      requestBody = JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }

    OpenstackService.LOGGER.debug(`Calling OpenStack API with ${JSON.stringify(requestOptions)}`);
    return new Promise((resolve, reject) => {
      let responseBody: string = '';
      const openstackRequest = http.request(requestOptions, (res) => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          OpenstackService.LOGGER.debug(`Response body - ${chunk}`);
          responseBody += chunk;
        });

        res.on('end', () => {
          // In some cases OpenStack APIs do not return a body
          if (parseInt(res.headers['content-length']) > 0) {
            res['body'] = JSON.parse(responseBody);
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            res['body'] = {'info': 'Successful API call'};
            return resolve(res);
          }

          OpenstackService.LOGGER.info(`OpenStack API Response - ${JSON.stringify(res.body)}`);
          if (res.body.error) {
             return reject((new ApiError(res.body.error.message, res.body.error.code, res.body.error.title)));
          }
          else {
             return resolve(res);
          }
        });
      });

      openstackRequest.on('error', (requestError) => {
        OpenstackService.LOGGER.error(`Request error - ${JSON.stringify(requestError)}`);
        return reject(new InternalError(requestError));
      });

      if (requestBody) {
        openstackRequest.write(requestBody);
      }

      openstackRequest.end();
    });
  };

  static parseCredentials(credentials: {}, apiVersion: string): Promise<any> {
    OpenstackService.LOGGER.debug(`Parsing credentials - ${JSON.stringify(credentials)}`);
    return new Promise((resolve, reject) => {
      switch (apiVersion) {
        case '2.0':
          if (credentials['username'] && credentials['password']) {
            return resolve({
              auth: {
                tenantName: credentials['tenant'] || '',
                passwordCredentials: {
                  username: credentials['username'],
                  password: credentials['password']
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

