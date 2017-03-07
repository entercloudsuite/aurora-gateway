import rabbit = require('rabbot');
import { Topology } from '../config';
import { Logger, LoggerFactory } from './';

export class RabbitClient {
  public rabbitConnection = rabbit;
  private exchangeName: string;

  public static LOGGER: Logger = LoggerFactory.getLogger();
  constructor(exchangeName: string, queueName: string) {
    this.exchangeName = exchangeName;
    Topology.createTopology(this.rabbitConnection)
      .then(() => {
        RabbitClient.LOGGER.info('Successfully initialized RabbitMQ connection');
        this.rabbitConnection.startSubscription(queueName);
      })
      .catch((error) => {
        RabbitClient.LOGGER.error('Error while trying to connect to RabbitMQ');
        RabbitClient.LOGGER.error(error);
      });
  }

  publishMessage(type: string, routingKey: string, message: any): Promise<any> {
    return this.rabbitConnection.publish(this.exchangeName, {
      type: type,
      routingKey: routingKey,
      body: message
    })
      .then(() => {
        RabbitClient.LOGGER.debug(`Published message - ${JSON.stringify(message)} on ${this.exchangeName}`);
      });
  }
}