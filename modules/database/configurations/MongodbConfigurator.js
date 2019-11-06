module.exports = class MongodbConfigurator {

    constructor(application, logger) {
        this.application = application;
        this.logger = logger;
    }

    static checkConfiguration(application) {
        if (application.mongo == null) {
            console.error("No Mongo configuration found !");
            return false
        }
        return false
    }
}