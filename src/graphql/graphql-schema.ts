import { Field, ObjectType, registerEnumType } from "type-graphql";

@ObjectType()
export class User{
    @Field()
    id : number;

    @Field()
    username : string;

    @Field()
    password : string;

    @Field({nullable : true})
    googleId? : string;

    @Field({nullable : true})
    facebookId? : string;

    @Field()
    email : string;

    @Field(type => [Friend])
    friends : [Friend]

    @Field(type => [Request])
    sentRequests : [Request]


    @Field(type => [Request])
    receivedRequests : [Request]

    @Field(type => [GroupMember])
    asMember : [GroupMember]



}

@ObjectType()
export class Friend{

    @Field(type => User)
    user : User;

    @Field()
    createdAt : string

    userId : number;
    friendId : number;

}

@ObjectType()
export class Request{

    @Field()
    id : number;

    @Field(type => User)
    from : User;

    @Field(type => User)
    to : User;

    @Field()
    createdAt : string;


    
}


@ObjectType()
export class MessageGroup{
    @Field()
    id : number;

    @Field(type => [GroupMember])
    members : [GroupMember];
    
    @Field()
    createdAt : string;
    
    @Field(type => groupType)
    type : groupType;
    
    @Field(type => Request)
    request? : Request

    @Field(type => [Message])
    messages : [Message]

}


@ObjectType()
export class GroupMember{
    @Field()
    id : number;

    @Field(type => User)
    user : User;

    @Field(type => MessageGroup)
    messageGroup : MessageGroup;
    
    @Field()
    joinedAt : string;
    
    @Field(type => relationToGroup)
    relationToGroup : relationToGroup;
    
}

@ObjectType()
export class Message{
    @Field()
    id : number;

    @Field(type => GroupMember)
    member : GroupMember;
    
    @Field()
    sentAt : string;
    
    @Field(type => MessageGroup)
    messageGroup : MessageGroup;
    
    @Field()
    message : string;

}

export enum groupType{
    DM,
    GROUP,
    REQUEST
  }
  
export enum relationToGroup{
    DM,
    RECEIVED_REQ,
    SENT_REQ,
    GROUP
  }

  registerEnumType(relationToGroup , {
      name : 'relationToGroup'
  })

  registerEnumType(groupType, {
      name : "groupType"
  })