import { Logger, LoggerFactory, InternalError } from '../common';
import http = require('http');

export class GatewayService {
  public serviceName: string;

  constructor(name: string) {
    this.serviceName = name;
  }

  private static LOGGER: Logger = LoggerFactory.getLogger();

  static sendRequest(options): Promise<any> {
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

    GatewayService.LOGGER.debug(`New request - ${JSON.stringify(requestOptions)}`);
    return new Promise((resolve, reject) => {
      let responseBody: string = '';
      const openstackRequest = http.request(requestOptions, (res) => {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          GatewayService.LOGGER.debug(`Response body - ${chunk}`);
          responseBody += chunk;
        });

        res.on('end', () => {
          res['body'] = responseBody;
          return resolve(res);
        });
      });

      openstackRequest.on('error', (requestError) => {
        GatewayService.LOGGER.error(`Request error - ${JSON.stringify(requestError)}`);
        return reject(new InternalError(requestError));
      });

      if (requestBody) {
        openstackRequest.write(requestBody);
      }

      openstackRequest.end();
    });
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