import rabbit = require('rabbot');
import { Topology } from '../config';
import { Logger, LoggerFactory, InternalError } from './';

export class RabbitClient {
  public rabbitConnection = rabbit;
  private exchangeName: string;
  public registeredMessages: {};
  public queueName: string;
  
  public static LOGGER: Logger = LoggerFactory.getLogger();
  constructor(exchangeName: string) {
    this.exchangeName = exchangeName;
  }

  connectClient(queueName: string, serviceId: string) {
    Topology.createTopology(this.rabbitConnection, serviceId)
      .then(() => {
        RabbitClient.LOGGER.info('Successfully initialized RabbitMQ connection');
        this.rabbitConnection.startSubscription(queueName);
      })
      .catch((error) => {
        RabbitClient.LOGGER.error('Error while trying to connect to RabbitMQ');
        RabbitClient.LOGGER.error(error);
        throw new InternalError(error);
      });
  }

  publishMessage(type: string, routingKey: string, message: any): Promise<any> {
    RabbitClient.LOGGER.debug(`Publishing message - ${JSON.stringify(message)} on ${this.exchangeName}`);
    return this.rabbitConnection.publish(this.exchangeName, {
      type: type,
      routingKey: routingKey,
      body: message
    });
  }
  
  notifyPublisher(message): Promise<any> {
    const messageParameter = {
      type: message.type,
      expiresAfter: 1000,
      routingKey: message.routingKey || '',
      body: message.body
    };

    return this.rabbitConnection.request(this.exchangeName, messageParameter)
      .then(response => {
        response.ack();
        RabbitClient.LOGGER.debug(`Publisher replied with ${JSON.stringify(response.body)}`);
        return Promise.resolve({
          body: response.body,
          keys: message.accessKey
        });
      });
  }
}


export let SubscriberClient = new RabbitClient(Topology.EXCHANGES.servicesExchange);
