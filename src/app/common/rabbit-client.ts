import rabbit = require('rabbot');
import { AMQPTopology } from '../config';
import { Logger, LoggerFactory, InternalError } from '../common';

export class RabbitClient {
  public rabbitConnection = rabbit;
  public generalExchangeName = AMQPTopology.GENERAL_EXCHANGE;
  public messageTypes = AMQPTopology.messageTypes;
  private static LOGGER: Logger = LoggerFactory.getLogger();


  constructor(queueName: string) {
    const amqpConfig: AMQPTopology = new AMQPTopology({
      user: process.env.RABBIT_USER,
      pass: process.env.RABBIT_PASSWORD,
      server: [ process.env.RABBIT_HOST ],
      port: process.env.RABBIT_PORT,
      vhost: '%2f',
      timeout: 1000,
      failAfter: 30,
      retryLimit: 400
    });

    amqpConfig.createTopology(this.rabbitConnection)
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

  publishMessage(exchangeName: string, type: string, routingKey: string, message: any): Promise<any> {
    return this.rabbitConnection.publish(exchangeName, {
      type: type,
      routingKey: routingKey,
      body: message
    });
  }
}
