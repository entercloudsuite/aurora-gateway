import { Logger, LoggerFactory, InternalError  } from '../common';
import { APP_CONFIG } from '../config';
import http = require('http');


export class ServiceUtils {
  private static LOGGER: Logger = LoggerFactory.getLogger();
  
  static registerService() {
    const serviceOptions = {
      name: APP_CONFIG.name,
      port: APP_CONFIG.port,
      routingPath: APP_CONFIG.gatewayRoutingPath,
    };

    ServiceUtils.LOGGER.info(`Registering new service with ${JSON.stringify(serviceOptions)}`);
    ServiceUtils.sendRequest({
        protocol: 'http:',
        host: APP_CONFIG.serviceManagerHost,
        port: APP_CONFIG.serviceManagerPort,
        path: '/register',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      }, serviceOptions
    )
      .then(result => {
        ServiceUtils.LOGGER.info(`Successfully registered new service - ${result.body}`);
      })
      .catch(error => {
        ServiceUtils.LOGGER.error(`Unable to register service - ${JSON.stringify(error)}`);        
      });
  }
  
  static sendRequest(requestOptions: {}, requestBody?: any) {
    if (requestBody) {
      requestBody = JSON.stringify(requestBody);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }
    
    ServiceUtils.LOGGER.debug(`Sending new request with ${JSON.stringify(requestOptions)}`);
    return new Promise((resolve, reject) => {
      let responseBody: string = '';
      const newRequest = http.request(requestOptions, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          responseBody += chunk;
        });

        res.on('end', () => {
          res['body'] = responseBody;
          return resolve(res);
        });
      });
      
      newRequest.on('error', requestError => {
        ServiceUtils.LOGGER.error(`Request error - ${requestError}`);
        return reject(new InternalError(requestError));
      });

      if (requestBody) {
        newRequest.write(requestBody);
      }

      newRequest.end();
    });
  }
}
