const { listModules } = require('awilix');
const path = require("path");

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

    if(ServiceBusAmqpProvider.checkConfiguration(application) || RabbitMQAmqpProvider.checkConfiguration(application)){
        await configure(application, container);
    }
};

async function configure(application, container) {
    const inBrokers = listModules(path.join(path.dirname(require.main.filename), "../",application.node_boot.modules.inBrokers));

    for(const key in inBrokers) {
        const className = inBrokers[key].name;
        const listen = container.resolve(convertToCamelCase(className)).listen;

        if (listen == undefined)
            throw new Error(className + " did not implement 'listen' method");

        container.resolve(convertToCamelCase(className)).listen();
    }
}

function convertToCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}