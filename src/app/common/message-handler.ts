import { RabbitClient, Logger, LoggerFactory } from './';
import { Express } from 'express';
import { ApiRouterFactory } from '../api';

export class MessageHandler {
  private rabbitClient: RabbitClient;
  private appInstance: Express;

  private static LOGGER: Logger = LoggerFactory.getLogger();
  constructor(queueName: string, appInstance: Express) {
    this.rabbitClient = new RabbitClient(queueName);
    this.appInstance = appInstance;
  }

  registerMessageHandlers() {
    MessageHandler.addService.bind(this.appInstance);

    this.rabbitClient.rabbitConnection.handle(
      this.rabbitClient.messageTypes.NEW_SERVICE,
      MessageHandler.addService
    );
  }

  static addService(message: any) {
    MessageHandler.LOGGER.debug(`${this}`);
    MessageHandler.LOGGER.debug(`Added new route for service - ${JSON.stringify(message.body)}`);
    const newRouter = ApiRouterFactory.registerNewAPI(message.body.path, message.body.name);
    this.use('/api' + message.body.routingPath, newRouter);
  }
}