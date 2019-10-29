const azure = require("azure-sb");
const {ServiceBusClient, ReceiveMode} = require("@azure/service-bus");
const ServiceBusHelper = require("../helpers/ServiceBusHelper")

module.exports = class ServiceBusAmqpProvider {

    constructor({application, logger}) {
        this.application = application;
        this.logger = logger;
    }

    static checkConfiguration(application) {
        if (application.amqp != null && application.amqp.azure_service_bus != null) {
            if (!application.amqp.azure_service_bus.connection_string) {
                console.error("[AzureServiceBus Setup] - Amqp Connection String not set.");
                return false;
            }
            return true;
        }
    }

    /**
     * Publish to a Topic in Azure ServiceBus
     * @param routingKey
     * @param exchangeName
     * @param data
     * @param headers
     * @returns {Promise<unknown>}
     */
    async publishToExchange({routingKey, exchangeName, data, headers}) {
        const {application} = this;
        const sbClient = ServiceBusClient.createFromConnectionString(application.amqp.azure_service_bus.connection_string);
        const topicClient = sbClient.createTopicClient(exchangeName);
        const sender = topicClient.createSender();

        return new Promise(async (resolve, reject) => {
            try {
                const message = this.buildQueueObject(data, headers);
                const payload = {
                    "body": message,
                    "label": routingKey
                };
                await sender.send(payload);

                await topicClient.close();
                await sbClient.close();
                resolve();
            } catch (e) {
                await sbClient.close();
                reject(e);
            }
        });

    }

    /**
     * Consume subscription(queue) from a topic(exchange)
     * Receive as param an array
     * [
     *      [String exchangeName, String queueName, Function consumerHandler],
     *      ...
     * ]
     * @param paramArray
     * @returns {Promise<void>}
     */
    async consumeExchangeByQueue(paramArray) {
        const {application, logger} = this;

        const sbClient = ServiceBusClient.createFromConnectionString(application.amqp.azure_service_bus.connection_string);

        await this.consume({sbClient}, paramArray);
    }

    /**
     * Consume Subscription by Topic
     * @param sbClient
     * @param paramArray
     * @returns {Promise<unknown>}
     */
    async consume({sbClient}, paramArray) {
        return new Promise(async (resolve, reject) => {

            paramArray.forEach((data) => {
                const subscriptionClient = sbClient.createSubscriptionClient(data[0], data[1]);
                const receiver = subscriptionClient.createReceiver(ReceiveMode.receiveAndDelete);
                if (this.application.amqp.verbose) {
                    subscriptionClient.getRules().then((result) => this.logger.debug("Filters of " + data[1] + " :" + JSON.stringify(result)));
                }
                receiver.registerMessageHandler((payload) => {
                    data[2](payload.body);
                }, error => reject(error));
            });

        });
    }


    /**
     * Setup the queues and exchanges based on the application file
     */
    async setupQueues() {
        const {application} = this;
        const binds = application.amqp.azure_service_bus.bindings;
        let serviceBusService;

        serviceBusService = azure.createServiceBusService(application.amqp.azure_service_bus.connection_string);

        if (application.amqp.verbose) this.logger.debug("[AzureServiceBus Setup] - Starting...");
        for (const bind of binds) {
            //Checking if Topic exists
            const {error, gettopicresult, resp} = await ServiceBusHelper.getTopic(serviceBusService, bind.topic.name);
            if (gettopicresult == null) {
                //Topic Not exist
                if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${bind.topic.name}] - Topic not exist.`);
                await this.createTopic(serviceBusService, application, bind);
            } else {
                //Topic Exist
                if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${bind.topic.name}] - Topic already exist.`);
                if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${bind.topic.name}] - Deleting Topic...`);
                await ServiceBusHelper.deleteTopic(serviceBusService, bind.topic.name)
                    .catch((error)=> this.logger.error(error));

                await this.createTopic(serviceBusService, application, bind);
            }
        }
        if (application.amqp.verbose) this.logger.debug("[AzureServiceBus Setup] - Finishing...");
    }


    /**
     * Create a Topic
     * @param serviceBusService
     * @param application
     * @param bind
     */
    async createTopic(serviceBusService, application, bind) {
        if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${bind.topic.name}] - Creating Topic...`);
        await ServiceBusHelper.createTopicIfNotExists(serviceBusService, bind.topic.name, bind.topic.options)
            .catch((error) => this.logger.error(error));
        for (const subscription of bind.subscriptions) {
            //Check if subscription (queue) exist
            const {error, getsubscriptionresult, resp} = await ServiceBusHelper.getSubscription(serviceBusService, bind.topic.name, subscription.name)
                .catch((error) => this.logger.error(error));

            if (getsubscriptionresult == null) {
                //Queue not exist
                if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${subscription.name}] - Subscription not exist in topic [${bind.topic.name}].`);
                await this.createSubscription(serviceBusService, application, bind, subscription);
            } else {
                //Queue already exist
                if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${subscription.name}] - Subscription already exist in topic [${bind.topic.name}].`);
                if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${subscription.name}] - Deleting Subscription from topic [${bind.topic.name}]...`);
                ServiceBusHelper.deleteSubscription(serviceBusService, bind.topic.name, subscription.name)
                    .catch((error)=>this.logger.error(error));

                await this.createSubscription(serviceBusService, application, bind, subscription);
            }
        }
    }

    /**
     * Create a subscription
     * @param serviceBusService
     * @param application
     * @param bind
     */
    async createSubscription(serviceBusService, application, bind, subscription) {
        if (application.amqp.verbose) this.logger.debug(`[AzureServiceBus Setup] - [${subscription.name}] - Creating Subscription in topic [${bind.topic.name}]...`);
        await ServiceBusHelper.createSubscription(serviceBusService, bind.topic.name, subscription.name)
            .catch((error) => this.logger.error(error));

        if (subscription.routingKey != null) {
            const {logger} = this;
            const rule = {
                deleteDefault: async function () {
                    await ServiceBusHelper.deleteRule(serviceBusService,
                        bind.topic.name,
                        subscription.name,
                        '$Default')
                        .catch((error)=>this.handleError(error));
                },
                create: async function () {
                    const ruleOptions = {
                        sqlExpressionFilter: 'sys.label=\'' + subscription.routingKey + '\''
                    };
                    await rule.deleteDefault();
                    await ServiceBusHelper.createRule(serviceBusService,
                        bind.topic.name,
                        subscription.name,
                        subscription.routingKey,
                        ruleOptions)
                        .catch((error)=>this.handleError(error));
                    if (application.amqp.verbose) logger.debug(`[AzureServiceBus Setup] - [${subscription.name}] - binding wih topic [${bind.topic.name}] with RoutingKey [${subscription.routingKey}]...`);
                },
                handleError: function (error) {
                    if (error) {
                        this.logger.error(error)
                    }
                }
            };
            await rule.create();
        }
    }

    errorHandler(error) {
        if (error) {
            if (error.code == 404) {
                this.logger.error(error.detail);
                this.logger.warn("Try running again the service bus setup.")
            }
            if (error.code != 409) {
                this.logger.error(error);
                process.exit(500);
            }
        }
    }

    /**
     * Object that is transferred between topics, based on AmqpLib object
     * @param payload
     * @param headers
     * @returns {{content: *, properties: {headers: *}}}
     */
    buildQueueObject(payload, headers) {
        return {
            content: JSON.stringify(payload),
            properties: {
                headers: headers
            }
        }
    }
}