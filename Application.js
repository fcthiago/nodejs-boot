module.exports = {
    server: {
        port: process.env.PORT || 3000
    },
    logging: {
        level: process.env.LOGGING_LEVEL || "debug"
    },
    node_boot: {
        modules: {
            controllers: "src/http/controllers/**/*.js",
            middlewares: "src/http/middlewares/**/*.js"
        },
        application_path: "src/Application.js"
    }
}