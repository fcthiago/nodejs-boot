const { listModules } = require('awilix');

module.exports = class MiddlewareConfigurator {
    constructor ({ application }) {
        this.modules = application.node_boot.modules;
    }

    configure (express, container) {
        const middlewares = listModules(this.modules.middlewares);

        for(const key in middlewares) {
            const className = middlewares[key].name;
            const middleware = container.resolve(this.convertToCamelCase(className));

            express.use(middleware);
        }
    }

    convertToCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

}
