import request = require('request');
import { Logger, LoggerFactory, InternalError, ApiError, InvalidJsonError } from '../common';
import util = require('util');

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

     static  sendRequest(options: {}): Promise<any> {
        let requestOptions = {
            'method':  options['method'] || 'GET',
            'uri': options['uri'],
            'json': options['json'] || true,
            'headers': options['headers'] || {'content-type': 'application/json'}
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
                OpenstackService.LOGGER.debug(`OpenStack API Response - ${JSON.stringify(response.body)}`);
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

