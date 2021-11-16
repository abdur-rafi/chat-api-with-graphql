import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Context } from "../../ctx";
import { User } from "../graphql-schema";

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
}