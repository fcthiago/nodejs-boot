module.exports = class SampleOutboundBroker {

    constructor({
                    logger,
                    rabbitMqAmqpProvider,
                }){
        this.logger = logger;
        this.amqpProvider = rabbitMqAmqpProvider;
    }

    async sendMessage(){
        const { amqpProvider, logger } = this;
        const message = {"message":"A Sample message"};
        const headers = {"content-type":"application/json"};

        logger.info(`publishing to x-message-created topic`);
        await amqpProvider.publishToExchange({ routingKey: "created", exchangeName: "x-message-created", data :message, headers: headers })
            .catch((error)=>{logger.error(error)});
    }

};