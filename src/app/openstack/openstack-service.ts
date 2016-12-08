import request = require('request');
import { Logger, LoggerFactory, InternalError, RestError } from '../common';

export class OpenstackService {
    public authUrl: string;
    private region: string;
    public apiVersion: string;

    private static readonly LOGGER: Logger = LoggerFactory.getLogger();

    constructor(options: Map<string, string>) {
        OpenstackService.LOGGER.info('Instatiating OpenstackService');
        this.authUrl = options['uri'];
        this.apiVersion = options['version'];

        OpenstackService.LOGGER.info(`OpenStack API Version - ${this.apiVersion}`);
        OpenstackService.LOGGER.info(`Keystone URL - ${this.authUrl}`);
        OpenstackService.sendRequest({'uri': this.authUrl})
            .then((result) => {
                if (result[0].statusCode !== 200) {
                    OpenstackService.LOGGER.error('Unable to reach Openstack API on specified endpoint');
                    throw new RestError('Error while testing Openstack API connection', result[0].statusCode, "OPENSTACK_API_ERROR")
                }
                OpenstackService.LOGGER.info('Validated API connection');
                OpenstackService.LOGGER.debug(JSON.stringify(result[1], null, 2));
            })
            .catch((error) => {
                OpenstackService.LOGGER.error('Error while testing OpenStack API');
                throw new InternalError(error);
            });
    }

     static  sendRequest(options: Map<string, string>): Promise<any> {
        let requestOptions = {
            'method':  options['method'] || 'GET',
            'uri': options['uri'],
            'headers': options['headers'] || {'content-type': 'application/json'}
        };
        OpenstackService.LOGGER.info(requestOptions);
        return new Promise((resolve, reject) => {
            request(requestOptions, (err, response, body) => {
                if (err) {
                    return reject(new InternalError(err));
                }
                return resolve([response, JSON.parse(body)]);
            });
        });
    };
}

