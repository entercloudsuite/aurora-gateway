# Aurora API
Aurora API provides a layer of abstraction between a client and an OpenStack infrastructure.

## Motivation
The project was design in order to provide a simple, decoupled environment, that can easily
incorporate new components.

## Reference
The architecture of the project follows 3 main components:

* The **API Gateway** is the entry point for an external client. It forwards client calls,
based on information provided by the **Service Manager** and following dynamically
created routes. Also it handles session management for each user.

* The **Service Manager** communicates with each service, registering each one of them
and attaching unique IDs to them. It provides the **API Gateway** with information regarding
the location of a desired type of service. It also listens for HEARBEAT messages from
each service, providing load balance functionality.

* **The Microservices** are single purpose processes designed to interact with OpenStack
components. They communicate using a transport layer, provided by RabbitMQ.
