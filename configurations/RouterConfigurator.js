const { listModules } = require('awilix');

module.exports = class RouterConfigurator {
    constructor ({ application }) {
        this.modules = application.node_boot.modules;
    }

    configure (express, container) {
        const controllers = listModules(this.modules.controllers);

        for(const key in controllers) {
            const className = controllers[key].name;
            const route = container.resolve(this.convertToCamelCase(className)).route;

            if (route == undefined)
                throw new Error(className + " did not implement 'route' method");

            express.use(route);
        }
    }

    convertToCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }
}
