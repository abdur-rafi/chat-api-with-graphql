"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const type_graphql_1 = require("type-graphql");
const mutations_1 = require("./graphql/resolvers/mutations");
const client_1 = require("@prisma/client");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const graphql_1 = require("graphql");
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const http_1 = require("http");
const query_1 = require("./graphql/resolvers/query");
const fieldResolvers_1 = require("./graphql/resolvers/fieldResolvers");
type_graphql_1.buildSchema({
    resolvers: [mutations_1.mutationResolver, query_1.queryResolver, fieldResolvers_1.userResolver, fieldResolvers_1.friendResolver, fieldResolvers_1.requestResolver, fieldResolvers_1.messageGroupResolver, fieldResolvers_1.groupMemberResolver, fieldResolvers_1.messageResolver]
})
    .then(async (schema) => {
    const app = express_1.default();
    const httpServer = http_1.createServer(app);
    const prisma = new client_1.PrismaClient();
    const subscriptionServer = new subscriptions_transport_ws_1.SubscriptionServer({
        schema,
        execute: graphql_1.execute,
        subscribe: graphql_1.subscribe,
        onConnect: (a, b) => {
            return {
                prisma: prisma,
            };
        }
    }, { server: httpServer, path: '/subscriptions' });
    const server = new apollo_server_express_1.ApolloServer({
        schema: schema,
        plugins: [apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground(), {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        }
                    };
                }
            }],
        context: ({ req }) => {
            return ({
                prisma: prisma,
            });
        }
    });
    await server.start();
    server.applyMiddleware({
        app,
        path: '/graphql'
    });
    app.use('/', (req, res, next) => {
        res.send('response');
    });
    httpServer.listen({ port: 4000 }, () => {
        console.log('App running at port 4000');
    });
});
