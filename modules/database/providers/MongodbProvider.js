const mongoose = require('mongoose');


module.exports = class MongodbProvider {

    constructor(application) {
        this.application = application
    }

    static connectDb(application) {
        return mongoose.connect(application.mongo.url);
    }
}