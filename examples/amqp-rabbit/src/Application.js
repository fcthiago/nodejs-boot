module.exports = {
    server: {
        port: process.env.PORT || 3000
    },
    amqp: {
        verbose: true,
        rabbitmq: {
            connection_string: "amqp://guest:guest@localhost:5672",
            bindings: [{
                exchange: {
                    name: "x-message-created",
                    type: "fanout",
                    options: {
                        durable: true,
                    },
                },
                queues: [{
                    name: "x-message-created.q-message-created",
                    routingKey: "created",
                    options: {
                        durable: true,
                    },
                }, ]
            }, ]
        },
    },
    mongo: {
        url: "mongodb://localhost:27017/node-express-mongodb-server"
    }
};