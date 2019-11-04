const { createContainer, asClass, asValue, Lifetime } = require('awilix');
const application = require('./Application');

const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');


module.exports = class NodeBoot {

    constructor(initParams) {
        this.container = createContainer();
        this.appConfig = Object.assign(application, initParams);
    }

    async start() {
        const { node_boot } = this.appConfig;

        try {
            this.appConfig = deepmerge(this.appConfig, require('../../' + node_boot.application_path));
        } catch (e) {}

        let nodeBootModulesResolved = [];
        Object.values(this.appConfig.node_boot.modules).forEach((pathString)=>{
            nodeBootModulesResolved.push(path.join(path.dirname(require.main.filename), "../", pathString));
        });
        let modules = [ path.join(__dirname,'/**/*.js') ].concat(Object.values(nodeBootModulesResolved));

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