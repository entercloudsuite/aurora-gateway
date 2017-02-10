import http = require('http');
import request = require('request');
import { Logger, LoggerFactory, InternalError, ApiError, ResourceNotFoundError } from '../common';
import util = require('util');
import url = require('url');
import events = require('events');

export class OpenstackService {
  
  private static LOGGER: Logger = LoggerFactory.getLogger();

  constructor() {}
  
  static callOSApi(options): Promise<any> {
    return OpenstackService.sendRequest(options)
      .then(APIResponse => {
        OpenstackService.LOGGER.info(`Original OpenStack API Response - ${JSON.stringify(APIResponse.body)}`);
        return OpenstackService.parseApiResponse(APIResponse);
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

  static parseApiResponse(APIResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      if (APIResponse.statusCode < 200 || APIResponse.statusCode > 299) {
        // In some cases OpenStack APIs return an html in case of error
        let OSApiError = {error: {}};
        try {
          OSApiError = JSON.parse(APIResponse.body);
          if (!OSApiError.error) {
            OSApiError = {
              'error': {
                'message': OSApiError,
                'code': APIResponse.statusCode,
                'title': 'OpenStack API error'
              }
            };
          }
        } catch (e) {
          OSApiError = {
            'error': {
              'message': APIResponse.body,
              'code': APIResponse.statusCode,
              'title': 'Unknown OpenStack API error'
            }
          };
        }
        return reject(new ApiError(OSApiError.error.message, OSApiError.error.code, OSApiError.error.title));
      } else if (parseInt(APIResponse.headers['content-length']) === 0) {
        // In some cases OS API returns an empty body (eg - on nova server actions)
        APIResponse.body = {'info': 'Successful API call'};
        return resolve(APIResponse);
      } else {
        APIResponse.body = JSON.parse(APIResponse.body);
        return resolve(APIResponse);
      }
    });
  }

  static  sendRequest(options): Promise<any> {
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

