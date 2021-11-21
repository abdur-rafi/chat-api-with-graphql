import { AuthChecker } from "type-graphql";
import { Context } from "../ctx";

export const authChecker : AuthChecker<Context> = ({context}, roles)=>{

    return context.userId != null;
}