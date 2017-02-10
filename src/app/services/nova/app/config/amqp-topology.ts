export class AMQPTopology {
  private connection: {};
  private exchanges: [{}];
  private queues: [{}];
  private bindings: [{}];

  public static monitoringExchangeName = 'aurora-monitoring-requests-x';
  public static messageTypes = {
    ADD: 'add',
    DELETE: 'delete',
    UPDATE: 'update'
  };

  constructor(connection) {
    this.connection = connection;

    this.exchanges = [
      {
        name: 'aurora-monitoring-requests-x',
        type: 'direct',
        autoDelete: 'true'
      },
      {
        name: 'aurora-monitoring-messages-x',
        type: 'fanout',
        autoDelete: 'true'
      }
    ];

    this.queues = [
      {
        name: 'aurora-monitoring-requests-q',
        autoDelete: true,
      },
      {
        name: 'aurora-monitoring-messages-q',
        autoDelete: true,
      }
    ];

    this.bindings = [
      {
        exchange: 'aurora-monitoring-requests-x',
        target: 'aurora-monitoring-requests-q',
        keys: ['monitoring']
      },
      {
        exchange: 'aurora-monitoring-messages-x',
        target: 'aurora-monitoring-messages-q',
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