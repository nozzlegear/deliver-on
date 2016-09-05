
import {Response, IReply} from "hapi";
import {notFound, wrap as boom} from "boom";
import {Server, Request, User} from "gearworks";
import {findUserByShopId} from "../../modules/database";
import {IProps as DeliverSettings} from "deliver-on-client";
import {Caches, getCacheValue, setCacheValue} from "../../modules/cache";
import {Domain, Host, isLive, NgrokDomain} from "../../modules/config";

export const Routes = {
    GetTag: "/tag.js",
}

export function registerRoutes(server: Server)
{
    server.route({
        method: "GET",
        path: Routes.GetTag,
        config: {
            auth: false,
            plugins: {
                crumb: false,
            }
        },
        handler: {
            async: (request, reply) => getTag(server, request, reply)
        }
    });
}

export async function getTag(server: Server, request: Request, reply: IReply)
{
    const query: {shopId: string} = request.query;

    if (!query.shopId)
    {
        return reply(notFound());
    }

    const cachedConfig = await getCacheValue<DeliverSettings>(Caches.userAuth, query.shopId.toString());
    let config: DeliverSettings = cachedConfig && cachedConfig.item;

    if (!cachedConfig)
    {
        let user: User;

        try 
        {
            user = await findUserByShopId(query.shopId);
        }
        catch (e)
        {
            console.error("Error finding user by shop id when retrieving tag config from database.", e);

            return reply(boom(e));
        }

        if (!user)
        {
            console.log("User not found");

            return reply(notFound());
        }

        config = user.appConfig;

        // Save the value in the cache.
        await setCacheValue(Caches.shopTagConfig, query.shopId.toString(), config);
    }

    // Client script should always be loaded from NPM CDN.
    const scriptUrl = `https://unpkg.com/deliver-on-client`;
    const js = `(function () { var config = ${JSON.stringify(config)}; var script = document.createElement("script");script.src = "${scriptUrl}";script.type = "text/javascript";script.onload = function () {new DeliverOn(config);}; document.body.appendChild(script); } ())`;

    return reply(js).type("text/javascript");
}