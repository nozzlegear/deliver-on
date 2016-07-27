/// <reference path="./../../typings/typings.d.ts" />

import * as joi from "joi";
import * as Boom from "boom";
import {IReply, Response} from "hapi";
import {Users} from "../../modules/database";
import {Server, Request, User} from "gearworks";
import {humanizeError} from "./../../modules/validation"; 
import {Caches, setCacheValue} from "../../modules/cache";
import {IProps as DeliverSettings} from "deliver-on-client";

export const Routes = {
    AppConfig: "/api/v1/config",
}

export const Validation = {
    UpdateAppConfig: joi.object().keys({
        label: joi.object().keys({
            text: joi.string().label("Label"),
            placement: joi.string().only("top", "right", "bottom", "left").label("Label placement"),
            textAlignment: joi.string().only("left", "right").label("Label text alignment"),
            classes: joi.string().optional().label("Label CSS classes"),
        }),
        input: joi.object().keys({
            classes: joi.string().optional().label("Text field CSS classes"),
            placeholder: joi.string().optional().label("Text field placeholder"),
        }),
        format: joi.string().only("mm/dd/yyyy", "dd/mm/yyyy").label("Format"),
        maxDays: joi.number().label("Maximum allowed days"),
        placement: joi.string().only("left", "right", "center"),
        allowChangeFromCheckout: joi.bool(),
        addPickerToCheckout: joi.bool(),
        error: joi.any().strip(),
        isSaving: joi.any().strip(),
    })
}

export function registerRoutes(server: Server)
{
    server.route({
        method: "OPTIONS",
        path: Routes.AppConfig,
        config: {
            auth: false,
            plugins: {
                crumb: false,
            }
        },
        handler: {
            async: (request, reply) => options(server, request, reply)
        }
    })

    server.route({
        method: "GET",
        path: Routes.AppConfig,
        config: {
            auth: false,
            plugins: {
                crumb: false,
            }
        },
        handler: {
            async: (request, reply) => getAppConfig(server, request, reply)
        }
    });

    server.route({
        method: "PUT",
        path: Routes.AppConfig,
        handler: {
            async: (request, reply) => updateAppConfig(server, request, reply)
        },
    })
}

export async function options(server: Server, request: Request, reply: IReply)
{
    return reply.continue();
}

export async function getAppConfig(server: Server, request: Request, reply: IReply)
{
    return reply(Boom.notImplemented());
}

export async function updateAppConfig(server: Server, request: Request, reply: IReply)
{
    const validation = joi.validate<DeliverSettings>(request.payload, Validation.UpdateAppConfig)

    if (validation.error)
    {
        return reply(Boom.badData(humanizeError(validation.error), validation.error));
    }

    const payload = validation.value;
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

    user.appConfig = payload;

    const update = await Users.put(user);

    if (!update.ok)
    {   
        console.error("Failed to update user's app config.", update);

        return reply(Boom.expectationFailed("Failed to update user's app config."));
    }

    // Bust the cache so users on the shop see this change immediately.
    await setCacheValue(Caches.shopTagConfig, user.shopifyShopId.toString(), user.appConfig);

    return reply.continue() as any;
}