import { Logger, LoggerFactory, InternalError  } from '../common';
import http = require('http');


export class ServiceUtils {
  private static LOGGER: Logger = LoggerFactory.getLogger();
  
  static registerService(): Promise<any>{
        const serviceOptions = {
      name: process.env.SERVICE_NAME,
      port: process.env.PORT,
      routingPath: process.env.GATEWAY_ROUTING_PATH,
      apiPath: process.env.SERVICE_API_PATH,
    };
    
    ServiceUtils.LOGGER.info(`Registering new service with ${JSON.stringify(serviceOptions)}`);
    return ServiceUtils.sendRequest({
        protocol: 'http:',
        host: process.env.REGISTRY_IP,
        port: process.env.REGISTRY_PORT,
        path: '/register',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      }, serviceOptions
    )
    .then(result => {
      return Promise.resolve(JSON.parse(result['body'])['data']);
    });
  }
  
  static sendRequest(requestOptions: {}, requestBody?: any): Promise<any> {
    if (requestBody) {
      requestBody = JSON.stringify(requestBody);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }
    
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
        ServiceUtils.LOGGER.error(`Request error - ${JSON.stringify(requestError)}`);
        return reject(new Error('Error sending request'));
      });

      if (requestBody) {
        newRequest.write(requestBody);
      }

      newRequest.end();
    });
  }
}
