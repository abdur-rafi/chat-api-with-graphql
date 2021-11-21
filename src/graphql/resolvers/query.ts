import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../../ctx";
import { GroupMember, MessageGroup, User } from "../graphql-schema";

@Resolver()
export class queryResolver{
    
    @Query(retunrs => String)
    feed(){
        return 'asdf'
    }

    @Query(retunrs => User)
    user(
        @Ctx() ctx : Context
    ){
        let userId = ctx.userId;
        let u = ctx.prisma.user.findUnique({
            where : {
                id : userId
            }
        })
        if(!u){
            throw new Error("User not found")
        }
        return u;

    }

    @Query(retunrs => [User])
    async users(
        @Ctx() ctx : Context
    ){
        return await ctx.prisma.user.findMany();
    }

    @Authorized()
    @Query(returns => [GroupMember])
    dmMembers(
        @Ctx() ctx : Context
    ){
        let userId = ctx.userId;
        return ctx.prisma.groupMember.findMany({ where : {userId : userId, relationToGroup : "DM"}})
    }

    @Authorized()
    @Query(returns => [GroupMember])
    sentReqMembers(
        @Ctx() ctx : Context
    ){
        let userId = ctx.userId;
        return ctx.prisma.groupMember.findMany({ where : {userId : userId, relationToGroup : "SENT_REQ"}})
    }

    
    @Authorized()
    @Query(returns => [GroupMember])
    receivedReqMembers(
        @Ctx() ctx : Context
    ){
        let userId = ctx.userId;
        return ctx.prisma.groupMember.findMany({ where : {userId : userId, relationToGroup : "RECEIVED_REQ"}})
    }
}