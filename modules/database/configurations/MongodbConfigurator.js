module.exports = class MongodbConfigurator {

    constructor({ application, logger }) {
        this.application = application;
        this.logger = logger;
    }

    static checkConfiguration(application) {
        if (application.mongo == null) {
            console.log("No mongo configuration found!")
            return false
        }
        console.log("Mongo configuration found, connecting ...");
        return true
    }
}