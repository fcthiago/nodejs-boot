const { createContainer, asClass, asValue, Lifetime } = require('awilix');
const application = require('./Application');

const fs = require('fs');
const path = require('path');


module.exports = class NodeBoot {

    constructor(initParams) {
        this.container = createContainer();
        this.appConfig = Object.assign(application, initParams);
    }

    async start() {
        const { node_boot } = this.appConfig;

        try {
            this.appConfig = Object.assign(this.appConfig, require('../../' + node_boot.application_path));
        } catch (e) {}

        let modules = [ path.join(__dirname,'/**/*.js') ].concat(Object.values(node_boot.modules));

        this.container.loadModules(modules,
            {
                formatName: 'camelCase',
                resolverOptions: {
                    lifetime: Lifetime.SINGLETON,
                }
            }
        );

        this.container.register({
            application: asValue(this.appConfig)
        });


        //Logging config
        const logger = this.container.resolve('logger');
        logger.level = application.logging.level;

        //Loading extra modules from NodeBoot
        const modulesFolder = path.join(__dirname, "/modules");
        for (const file of fs.readdirSync(modulesFolder)) {
            let module = require(require.resolve("./modules/"+file));
            await module(this.container);
        }

        this.container.resolve('expressWebServer').start(this.container);
    }
};