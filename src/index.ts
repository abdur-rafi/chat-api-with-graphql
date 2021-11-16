import "reflect-metadata";
import express from 'express'
import { buildSchema } from "type-graphql";
import { mutationResolver } from "./graphql/resolvers/mutations";
import { PrismaClient } from "@prisma/client";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { Context } from "./ctx";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import {createServer} from 'http'
import { queryResolver } from "./graphql/resolvers/query";
import { friendResolver, groupMemberResolver, messageGroupResolver, messageResolver, requestResolver, userResolver } from "./graphql/resolvers/fieldResolvers";

buildSchema({
    resolvers : [mutationResolver, queryResolver, userResolver, friendResolver, requestResolver, messageGroupResolver, groupMemberResolver, messageResolver]
})
.then(async schema =>{
    const app = express();
    const httpServer = createServer(app);
    const prisma = new PrismaClient();

    const subscriptionServer = new SubscriptionServer(
        { 
            schema,
            execute,
            subscribe,
            onConnect : (a : any, b : any) : Context=>{

                return {
                    prisma : prisma,
                }
            } 
        },
        { server: httpServer, path: '/subscriptions' },
        
      );


    const server = new ApolloServer({
        schema : schema,
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground(), {
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
        context : ({req}) : Context =>{
            return({
                prisma : prisma,
            })
        }
    })

    await server.start();

    server.applyMiddleware({
        app,
        path: '/graphql'
    });
    
    app.use('/', (req, res, next)=>{
        res.send('response')
    })

    httpServer.listen({ port: 4000 }, ()=>{
        console.log('App running at port 4000')
    })
})

