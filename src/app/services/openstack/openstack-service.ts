import http = require('http');
import request = require('request');
import { Logger, LoggerFactory, InternalError, ApiError, ResourceNotFoundError } from '../../common';
import util = require('util');
import url = require('url');
import events = require('events');
import { EventEmitter } from '../../common';
import { OpenstackRequest } from '../../../@types_local/openstack-request';
import { OpenstackUtils } from '../../utils';

export class OpenstackService {
  public keystoneApiHost: string;
  public keystoneApiPort: string;
  public keystoneApiPath: string;
  public keystoneApiVersion: string;
  
  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor(options: {}) {
    OpenstackService.LOGGER.info('Instatiating OpenstackService');
    this.keystoneApiHost = options.host;
    this.keystoneApiPort = options.port;
    this.keystoneApiPath = options.path;
    this.keystoneApiVersion = options.version;
    
    EventEmitter.eventEmitter.on(
      EventEmitter.NEW_SERVICE_CATALOG,
      this.updateServiceCatalog
    );
    
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
    newServiceCatalog.forEach((item) => {
      item['endpoints'].forEach((endpoint) => {
        EventEmitter.emitUpdateEvent(item['name'], endpoint);
      });
    });
  }
  
  static callOSApi(options: OpenstackRequest): Promise<any> {
    return OpenstackService.sendRequest(options)
      .then(APIResponse => {
        OpenstackService.LOGGER.info(`Original OpenStack API Response - ${JSON.stringify(APIResponse.body)}`);
        return OpenstackUtils.parseApiResponse(APIResponse);
      })
      .then(parsedResponse => {
        OpenstackService.LOGGER.info(`Parsed OpenStack API Response - ${JSON.stringify(parsedResponse.body)}`);
        return Promise.resolve(parsedResponse);
      })
      .catch(OSRequestError => {
        OpenstackService.LOGGER.info(`Error occurred while trying to call OpenStack API - ${JSON.stringify(OSRequestError)}`);
        return Promise.reject(OSRequestError);
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
          res['body'] = responseBody;
          return resolve(res);
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
}

