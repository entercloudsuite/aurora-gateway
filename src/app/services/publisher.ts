import rabbit = require('rabbot');
import { AMQPTopology } from '../config';
import { Logger, LoggerFactory, InternalError } from '../common';

export class Publisher {
  private rabbitConnection = rabbit;
  public monitoringExchangeName = AMQPTopology.monitoringExchangeName;
  
  private static readonly LOGGER: Logger = LoggerFactory.getLogger();
  constructor() {
    const amqpConfig: AMQPTopology = new AMQPTopology({
      user: 'guest',
      pass: 'guest',
      server: [ '127.0.0.1' ],
      port: 5672,
      vhost: '%2f',
      timeout: 1000,
      failAfter: 30,
      retryLimit: 400
    });

    amqpConfig.createTopology(this.rabbitConnection)
      .then(() => {
        Publisher.LOGGER.info('Successfully initialized RabbitMQ connection');
    })
      .catch((error) => {
        Publisher.LOGGER.error('Error while trying to connect to RabbitMQ');
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