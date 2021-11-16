import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../../ctx";
import { Friend, Message, Request, User } from "../graphql-schema";

@Resolver()
export class mutationResolver{
    
    @Mutation(returns => User)
    async createUser(
        @Ctx() ctx : Context,
        @Arg("username") username : string,
        @Arg("password") password : string,
        @Arg('email') email : string
    ){
        let t = await ctx.prisma.user.findUnique({where : {email : email}})
        if(t){
            throw new Error(`Email already used`)
        }
        return await ctx.prisma.user.create({
            data : {
                email : email,
                password : password,
                username : username,
            }
        })
    }

    
    @Mutation(returns => Request)
    async postRequest(
        @Ctx() ctx : Context,
        @Arg('fromId') fromId : number,
        @Arg('toId') toId : number
    ){
        let f = await ctx.prisma.friend.findUnique({
            where : {
                userId_friendId : {
                    userId : fromId,
                    friendId : toId
                }
            }
        })
        if(f){
            throw new Error("Users are already friends")
        }
        return await ctx.prisma.request.create({
            data : {
                from : { connect : {id : fromId} },
                to : { connect : {id : toId}},
                messageGroup : {
                    create : {
                        members : {
                            create : [
                                {
                                    user : {connect : {id : fromId}},
                                    relationToGroup : "SENT_REQ"
                                },
                                {
                                    user : {connect : {id : toId}},
                                    relationToGroup : "RECEIVED_REQ"
                                }
                            ]
                        },
                        type : 'REQUEST'
                    }
                }
            }
        })

    }

    
    @Mutation(returns => Friend)
    async acceptRequest(
        @Ctx() ctx : Context,
        @Arg('reqId') reqId : number
    ){
        // create 2 friends, modify messageGroup, delete request , modify membership
        let req = await ctx.prisma.request.findUnique({where : { id : reqId }})
        if(!req){
            throw new Error("Request not found")
        }
        let toId = req.toId
        let fromId = req.fromId

        let p1 = ctx.prisma.friend.createMany({
            data : [
                {
                    friendId : toId,
                    userId : fromId
                },
                {
                    friendId : fromId,
                    userId : toId
                }
            ]
        })
        let p2 = ctx.prisma.messageGroup.update({
            where : {id : req.messageGroupId},
            data : {type : 'DM'}
        })
        

        let p3 = ctx.prisma.groupMember.updateMany({
            where : {
                groupId : req.messageGroupId
            },
            data : {
                relationToGroup : 'DM'
            }
        })

        let p4 = ctx.prisma.request.delete({
            where : {
                id : reqId
            }
        })

        await Promise.all([p1, p2, p3, p4])

        return await ctx.prisma.friend.findUnique({
            where : {
                userId_friendId : {
                    userId : fromId,
                    friendId : toId
                }
            }
        })

    }

    @Mutation(type => Message)
    async postMessage(
        @Ctx() ctx : Context,
        @Arg('groupId') groupId : number,
        @Arg('memberId') memberId : number,
        @Arg('message') message : string 
    ){
        return await ctx.prisma.message.create({
            data : {
                message : message,
                member : { connect : { id : memberId } },
                messageGroup : {connect : {id : groupId}}
            }
        })
    }

}