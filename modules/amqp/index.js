const RabbitMQAmqpProvider = require("./providers/RabbitMQAmqpProvider");
const ServiceBusAmqpProvider = require("./providers/ServiceBusAmqpProvider");

module.exports = async (container) => {
    const application = container.resolve("application");

    if(RabbitMQAmqpProvider.checkConfiguration(application)){
        const rabbitMQAmqpProvider = container.resolve("rabbitMqAmqpProvider");
        await rabbitMQAmqpProvider.setupQueues();
    }
    if(ServiceBusAmqpProvider.checkConfiguration(application)){
        const serviceBusAmqpProvider = container.resolve("serviceBusAmqpProvider");
        await serviceBusAmqpProvider.setupQueues();
    }

};