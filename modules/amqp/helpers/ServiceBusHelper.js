module.exports = class ServiceBusHelper {

    static async getTopic(serviceBusService, topic){
        return new Promise(((resolve, reject) => {
            serviceBusService.getTopic(topic, (error, gettopicresult, resp) => {
                resolve({error, gettopicresult, resp});
            });
        }));
    }

    static async deleteTopic(serviceBusService, topic){
        return new Promise(((resolve, reject) => {
            serviceBusService.deleteTopic(topic, async (err, resp) => {
                if(err) reject(err);
                resolve();
            });
        }));
    }

    static async createTopicIfNotExists(serviceBusService, topic, options){
        return new Promise(((resolve, reject) => {
            serviceBusService.createTopicIfNotExists(topic, options, (error) => {
                if(error) reject(error);
                resolve();
            });
        }));
    }

    static async getSubscription(serviceBusService, topic, subscription){
        return new Promise(((resolve, reject) => {
            serviceBusService.getSubscription(topic, subscription, (error, getsubscriptionresult, resp) => {

                resolve({error, getsubscriptionresult, resp})
            });
        }));
    }

    static async createSubscription(serviceBusService, topic, subscription){
        return new Promise(((resolve, reject) => {
            serviceBusService.createSubscription(topic, subscription, (error) => {
                if(error) reject(error);

                resolve();
            });
        }));
    }

    static async deleteSubscription(serviceBusService, topic, subscription){
        return new Promise(((resolve, reject) => {
            serviceBusService.deleteSubscription(topic, subscription, (error) => {
                if(error) reject(error);
                resolve();
            });
        }));
    }

    static async createRule(serviceBusService, topic, subscription, routingKey, options){
        return new Promise(((resolve, reject) => {
            serviceBusService.createRule(topic, subscription, routingKey, options, (error)=>{
                if(error) reject(error);
                resolve();
            });
        }));
    }

    static async deleteRule(serviceBusService, topic, subscription, ruleName){
        return new Promise(((resolve, reject) => {
            serviceBusService.deleteRule(topic,
                subscription,
                ruleName,
                function (error){
                    if(error) {
                        reject(error);
                    }
                    resolve();
                });
        }));
    }

}