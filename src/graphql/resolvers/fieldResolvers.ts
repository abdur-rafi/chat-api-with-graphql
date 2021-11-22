import { Arg, Ctx, Field, FieldResolver, Resolver, Root } from "type-graphql";
import { Context } from "../ctx";
import { Friend, GroupMember, groupType, Message, MessageGroup, relationToGroup, Request, User } from "../graphql-schema";

@Resolver(of => User)
export class userResolver{

    @FieldResolver(returns => [Friend])
    async friends(
        @Ctx() ctx : Context,
        @Root() user : User
    ){
        
        return await ctx.prisma.user.findUnique({
            where : {
                id : user.id
            }
        }).friends()

    }

    @FieldResolver(returns => [Request])
    async sentRequests(
        @Ctx() ctx : Context,
        @Root() user : User
    ){
        
        return await ctx.prisma.user.findUnique({
            where : {
                id : user.id
            }
        }).sentRequests()

    }

    
    @FieldResolver(returns => [Request])
    async receivedRequests(
        @Ctx() ctx : Context,
        @Root() user : User
    ){
        
        return await ctx.prisma.user.findUnique({
            where : {
                id : user.id
            }
        }).receivedRequests()

    }

    @FieldResolver(retunrs => [GroupMember])
    asMember(
        @Ctx() ctx : Context,
        @Root() user : User
    ){
        return ctx.prisma.user.findUnique({
            where : {id : user.id}
        }).asMember()

    }
}

@Resolver(of => Friend)
export class friendResolver{
    @FieldResolver(retunrs => User)
    async user(
        @Ctx() ctx : Context,
        @Root() friend : Friend
    ){
        return await ctx.prisma.friend.findUnique({
            where : {
                userId_friendId : {
                    friendId : friend.friendId,
                    userId : friend.userId
                }
            }
        }).friend()
    }
}

@Resolver(of => Request)
export class requestResolver{
    @FieldResolver(type => User)
    from(
        @Ctx() ctx : Context,
        @Root() req : Request
    ){
        return ctx.prisma.request.findUnique({where : {id : req.id}}).from()
    }

    
    @FieldResolver(type => User)
    to(
        @Ctx() ctx : Context,
        @Root() req : Request
    ){
        return ctx.prisma.request.findUnique({where : {id : req.id}}).to()
    }
}

@Resolver(of => MessageGroup)
export class messageGroupResolver{
    @FieldResolver(type => [GroupMember])
    members(
        @Ctx() ctx : Context,
        @Root() group : MessageGroup
    ){
        return ctx.prisma.messageGroup.findUnique({where : {id : group.id}}).members()
    }

    @FieldResolver(type => groupType)
    type(
        @Root() group : MessageGroup
    ){
        return groupType[group.type]
    }

    @FieldResolver(type => Request, {nullable : true})
    request(
        @Ctx() ctx : Context,
        @Root() group : MessageGroup    
    ){
        return ctx.prisma.messageGroup.findUnique({where : {id : group.id}}).request()
    }
    
    @FieldResolver(type => [Message])
    messages(
        @Ctx() ctx : Context,
        @Root() group : MessageGroup
    ){
        return ctx.prisma.messageGroup.findUnique({where : {id : group.id}}).messages()
    }
    
}


@Resolver(of => GroupMember)
export class groupMemberResolver{

    @FieldResolver(type => User)
    async user(
        @Ctx() ctx : Context,
        @Root() member : GroupMember
    ){
        return await ctx.prisma.groupMember.findUnique({
            where : {
                id : member.id
            }
        }).user()
        
    }


    @FieldResolver(type => MessageGroup)
    async messageGroup(
        @Ctx() ctx : Context,
        @Root() member : GroupMember
    ){
        return await ctx.prisma.groupMember.findUnique({
            where : {
                id : member.id
            }
        }).Group()
        
    }

    @FieldResolver(type => relationToGroup)
    async relationToGroup(
        @Ctx() ctx : Context,
        @Root() member : GroupMember
    ){
        return relationToGroup[member.relationToGroup]   
    }
}

@Resolver(of => Message)
export class messageResolver{
    @FieldResolver(type => GroupMember)
    member(
        @Ctx() ctx : Context,
        @Root() message : Message
    ){
        return ctx.prisma.message.findUnique({where : {id : message.id}})
        .member()
    }

    @FieldResolver(type => MessageGroup)
    messageGroup(
        @Ctx() ctx : Context,
        @Root() message : Message
    ){
        return ctx.prisma.message.findUnique({where : {id : message.id}})
        .messageGroup()
    }
    
}