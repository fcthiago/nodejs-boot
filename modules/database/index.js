const MongodbConfigurator = require('./configurations/MongodbConfigurator')
const MongodbProvider = require('./providers/MongodbProvider')

module.exports = async(container) => {
    const application = container.resolve("application");

    if (MongodbConfigurator.checkConfiguration(application)) {
        MongodbProvider.connectDb(application)
    }
}