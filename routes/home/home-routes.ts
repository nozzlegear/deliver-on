/// <reference path="./../../typings/typings.d.ts" />

import {IReply} from "hapi";
import * as Boom from "boom";
import {Users} from "../../modules/database";
import {IProps} from "./../../views/home/home";
import {Server, AuthCredentials, AuthArtifacts, Request, User} from "gearworks";

export const Routes = {
    GetHome: "/"
}

export function registerRoutes(server: Server)
{
    server.route({
        path: Routes.GetHome,
        method: "GET",
        handler: {
            async: (request, reply) => getHomepage(server, request, reply)
        }
    })
}

export async function getHomepage(server: Server, request: Request, reply: IReply)
{
    let user: User;

    try
    {
        user = await Users.get<User>(request.auth.credentials.userId);
    }
    catch (e)
    {
        console.error("Failed to retrieve user from database.", e);

        return reply(Boom.wrap(e));
    }

    const props: IProps = {
        title: "Your Dashboard",
        shopName: request.auth.artifacts.shopName,
        settings: user.appConfig
    }
    
    return reply.view("home/home.js", props)
}