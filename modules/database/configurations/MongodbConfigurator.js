module.exports = class MongodbConfigurator {

    constructor({ application, logger }) {
        this.application = application;
        this.logger = logger;
    }

    static checkConfiguration(application) {
        if (application.mongo == null) {
            this.logger.info("No Mongo configuration found !");
            return false
        }
        this.logger.info("Mongo configuration found, connecting ...");
        return true
    }
}