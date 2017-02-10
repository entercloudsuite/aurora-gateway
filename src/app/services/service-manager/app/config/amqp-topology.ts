export class AMQPTopology {
  private connection: {};
  private exchanges: [{}];
  private queues: [{}];
  private bindings: [{}];

  public static GENERAL_EXCHANGE = 'aurora-general-x';
  public static messageTypes = {
    NEW_SERVICE: 'NEW_SERVICE',
    REMOVE_SERVICE: 'REMOVE_SERVICE',
    SERVICE_UPDATE: 'SERVICE_UPDATE'
  };

  constructor(connection) {
    this.connection = connection;

    this.exchanges = [
      {
        name: 'aurora-general-x',
        type: 'direct',
        autoDelete: 'true'
      },
      {
        name: 'aurora-services-x',
        type: 'fanout',
        autoDelete: 'true'
      }
    ];

    this.queues = [
      {
        name: 'aurora-general',
        autoDelete: true,
      },
      {
        name: 'aurora-services',
        autoDelete: true,
      }
    ];

    this.bindings = [
      {
        exchange: 'aurora-general-x',
        target: 'aurora-general',
        keys: []
      },
      {
        exchange: 'aurora-services-x',
        target: 'aurora-services',
        keys: []
      }
    ];
  }

  createTopology(rabbit): any {
    return rabbit.configure({
      connection: this.connection,
      exchanges: this.exchanges,
      queues: this.queues,
      bindings: this.bindings
    });
  }
}