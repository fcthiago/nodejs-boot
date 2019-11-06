const { listModules } = require('awilix');
const path = require("path");

module.exports = class AmqpConfigurator {

    constructor(){
    }

    configure(application, container) {
        const inBrokers = listModules(path.join(path.dirname(require.main.filename), "../",application.node_boot.modules.in_brokers));

        for(const key in inBrokers) {
            const className = inBrokers[key].name;
            const listen = container.resolve(this.convertToCamelCase(className)).listen;

            if (listen == undefined)
                throw new Error(className + " did not implement 'listen' method");

            container.resolve(this.convertToCamelCase(className)).listen();
        }
    }

    convertToCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }
};