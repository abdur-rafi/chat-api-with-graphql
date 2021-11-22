import "reflect-metadata";
import express from 'express'
import { buildSchema } from "type-graphql";
import { mutationResolver } from "./graphql/resolvers/mutations";
import { PrismaClient } from "@prisma/client";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { Context } from "./graphql/ctx";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import {createServer} from 'http'
import { queryResolver } from "./graphql/resolvers/query";
import { friendResolver, groupMemberResolver, messageGroupResolver, messageResolver, requestResolver, userResolver } from "./graphql/resolvers/fieldResolvers";
import { authChecker } from "./graphql/authChecker";
import jwt from 'jsonwebtoken'
import { PubSub } from "graphql-subscriptions";
import { subscriptionResolver } from "./graphql/resolvers/subscriptionResolver";

let pubsub = new PubSub()

buildSchema({
    resolvers : [mutationResolver, queryResolver, userResolver, friendResolver, requestResolver,
         messageGroupResolver, groupMemberResolver, messageResolver, subscriptionResolver],
    authChecker : authChecker,
    pubSub : pubsub
})
.then(async schema =>{
    const app = express();
    const httpServer = createServer(app);
    const prisma = new PrismaClient();

    // console.log(process.env)

    const subscriptionServer = new SubscriptionServer(
        { 
            schema,
            execute,
            subscribe,
            onConnect : (a : any, b : any) : Context=>{
                // console.log("a", a)
                // console.log("b", b)
                let token = ''
                let userId : number | undefined;
                if(a.Authorization){
                    token = a.Authorization.replace('Bearer ', '')
                }
                if(token.length > 0){
                    let payload = jwt.verify(token, process.env.JWTSECRET!) as string;
                    userId = parseInt(payload)
                }

                return {
                    prisma : prisma,
                    userId : userId
                }
            } 
        },
        { server: httpServer, path: '/graphql' },
        
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
            let token = ''
            let userId : number | undefined;
            if(req.headers.authorization){
                token = req.headers.authorization.replace('Bearer ', '')
            }
            if(token.length > 0){
                let payload = jwt.verify(token, process.env.JWTSECRET!) as string;
                userId = parseInt(payload)

            }
            return({
                prisma : prisma,
                userId : userId
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

