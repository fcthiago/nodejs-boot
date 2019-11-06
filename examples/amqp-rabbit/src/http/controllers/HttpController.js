module.exports = class HttpController {

    constructor ({ logger, router, sampleOutboundBroker }) {
        this.logger = logger;
        this.router = router;
        this.outboundBroker = sampleOutboundBroker;
    }

    get route () {
        this.router.get('/', this.home());
        return this.router;
    }

    home () {
        return async (request, response, next) => {
            try {
                const {outboundBroker} = this;
                await outboundBroker.sendMessage();
                response.json({
                    "status_code": 200,
                    "message": "Message published with success!!"
                }).end();
            } catch (error) {
                next(error);
            }
        }
    }
}