import {PrismaClient , Message, MessageGroup, groupMember} from ".prisma/client";

interface Context{
    prisma : PrismaClient,
    userId? : number
}

interface newMessagePayload{
    message : Message,
    to : number[]
}

// interface newGroupPayload{
//     group : MessageGroup,
//     newMemberUserId : number
// }

interface newAsMemberPayload{
    member : groupMember,
    newMemberId : number
}

interface newGroupMember{
    member : groupMember,
    otherMembersId : number[]
}