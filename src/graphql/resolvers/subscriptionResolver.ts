import { Authorized, PubSub, PubSubEngine, Resolver, Root, Subscription } from "type-graphql";
import { Context,  newAsMemberPayload,  newGroupMember,  newMessagePayload } from "../ctx";
import { GroupMember, Message } from "../graphql-schema";
import { subscriptionTopicConstants } from "./subscriptionTopicConstants";

@Resolver()
export class subscriptionResolver{

    @Authorized()
    @Subscription({
        topics : 'TEST',
        filter : ({payload, args, context, info})=>{
            let ctx = context as Context
            console.log(ctx.userId)
            console.log("payload", payload)
            return true;
        }
    })
    test(
        @Root() r : string
    ) : string{
        // console.log(r)
        return r
    }

    @Authorized()
    @Subscription({
        topics : subscriptionTopicConstants.NEW_MESSAGE,
        filter : ({payload, context})=>{
            let ctx = context as Context
            let pl = payload as newMessagePayload
            return pl.to.includes(ctx.userId!) 
        }
    })
    newMessage(@Root() pl : newMessagePayload) : Message{
        return  pl.message as any
    }

    @Authorized()
    @Subscription({
        topics : subscriptionTopicConstants.NEW_AS_MEMBER,
        filter : ({payload, context})=>{
            let ctx = context as Context
            let pl = payload as newAsMemberPayload
            return ctx.userId == pl.newMemberId
        }
    })
    newAsMember(@Root() pl : newAsMemberPayload) : GroupMember{
        return  pl.member as any
    }


    @Authorized()
    @Subscription({
        topics : subscriptionTopicConstants.NEW_GROUP_MEMBER,
        filter : ({payload, context})=>{
            let ctx = context as Context
            let pl = payload as newGroupMember
            return pl.otherMembersId.includes(ctx.userId!)
        }
    })
    newGroupMember(@Root() pl : newGroupMember) : GroupMember{
        return  pl.member as any
    }
}