import { Arg, Ctx, Query, Resolver } from "type-graphql";
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
        @Ctx() ctx : Context, 
        @Arg('id') id : number
    ){
        let u = ctx.prisma.user.findUnique({
            where : {
                id : id
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

    @Query(returns => [GroupMember])
    dmMembers(
        @Ctx() ctx : Context,
        @Arg('userId') userId : number
    ){
        return ctx.prisma.groupMember.findMany({ where : {userId : userId, relationToGroup : "DM"}})
    }

    @Query(returns => [GroupMember])
    sentReqMembers(
        @Ctx() ctx : Context,
        @Arg('userId') userId : number
    ){
        return ctx.prisma.groupMember.findMany({ where : {userId : userId, relationToGroup : "SENT_REQ"}})
    }

    
    @Query(returns => [GroupMember])
    receivedReqMembers(
        @Ctx() ctx : Context,
        @Arg('userId') userId : number
    ){
        return ctx.prisma.groupMember.findMany({ where : {userId : userId, relationToGroup : "RECEIVED_REQ"}})
    }
}