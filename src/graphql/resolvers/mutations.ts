import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { Context } from "../../ctx";
import { Friend, GroupMember, Message, MessageGroup, Request, User, UserWithToken } from "../graphql-schema";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

@Resolver()
export class mutationResolver{
    
    @Mutation(returns => UserWithToken)
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
        let salt = await bcrypt.genSalt()
        let hash = await bcrypt.hash(password, salt)
        password = hash
        let user = await ctx.prisma.user.create({
            data : {
                email : email,
                password : password,
                username : username,
            }
        })

        let token = jwt.sign(user.id.toString(), process.env.JWTSECRET!)
        
        
        return {
            user : user,
            token : token
        }
    }

    @Mutation(returns => UserWithToken)
    async login(
        @Ctx() ctx : Context,
        @Arg('email') email : string,
        @Arg('password') password : string
    ){
        let user = await ctx.prisma.user.findUnique({where : {email : email}})
        if(!user){
            throw new Error("No User Found");
        }
        let b = await bcrypt.compare(password, user.password)
        if(!b){
            throw new Error("Invalid password");
        }

        let token = jwt.sign(user.id.toString(), process.env.JWTSECRET!)
        
        
        return {
            user : user,
            token : token
        }

    }

    @Authorized()
    @Mutation(returns => Request)
    async postRequest(
        @Ctx() ctx : Context,
        @Arg('toId') toId : number
    ){
        let fromId = ctx.userId!;
        if(fromId == toId){
            throw new Error("Invalid argument");
        }
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

    @Authorized()
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
        if(req.toId !== ctx.userId){
            throw new Error("Unauthorized");
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

    @Authorized()
    @Mutation(returns => Message)
    async postMessage(
        @Ctx() ctx : Context,
        @Arg('memberId') memberId : number,
        @Arg('message') message : string 
    ){
        let member = await ctx.prisma.groupMember.findUnique({ where : {id : memberId}})
        if(!member || member.userId !== ctx.userId){
            throw new Error("Unauthorized");
        }
        return await ctx.prisma.message.create({
            data : {
                message : message,
                member : { connect : { id : memberId } },
                messageGroup : {connect : {id : member.groupId}}
            }
        })
    }

    @Authorized()
    @Mutation(returns => Request)
    async deleteRequest(
        @Ctx() ctx : Context,
        @Arg('reqId') reqId : number
    ){
        let r = await ctx.prisma.request.findUnique({where : {id : reqId}})
        if(!r) throw new Error("Request not found");

        if(r.toId !== ctx.userId && r.fromId !== ctx.userId){
            throw new Error("Unauthorized");
        }
        await ctx.prisma.messageGroup.delete({where : {id : r?.messageGroupId}})
        return r;
    }

    @Authorized()
    @Mutation(type => MessageGroup)
    createGroup(
        @Ctx() ctx : Context
    ){
        let userId = ctx.userId;
        return ctx.prisma.messageGroup.create({
            data : {
                members : {
                    create : {user : {connect : {id : userId}}, relationToGroup : "GROUP"},
                },
                type : "GROUP"
            }
        })
    }

    @Authorized()
    @Mutation(returns => GroupMember)
    async addMember(
        @Ctx() ctx : Context,
        @Arg('groupId') groupId : number,
        @Arg('newMemberId') newMemberId : number
    ){
        let f = await ctx.prisma.friend.findUnique({where : {userId_friendId : {userId : ctx.userId!, friendId : newMemberId}}})
        if(!f) throw new Error("Unauthorized");
        let m = await ctx.prisma.groupMember.findUnique({where : {userId_groupId : {userId : ctx.userId!, groupId : groupId}}})
        if(!m){
            throw new Error("Unauthorized");
        }
        
        return ctx.prisma.groupMember.create({
            data : {
                Group : {connect : {id : groupId}},
                user : {connect : {id : newMemberId}},
                relationToGroup : "GROUP"
            }
        })

    }

}