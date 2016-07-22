/// <reference path="./../typings/typings.d.ts" />

import * as Bluebird from "bluebird";
import {DatabaseUrl} from "./config";
import {Server, CacheConfig} from "gearworks";
import {Client, CachePolicy, CachedItem} from "catbox";

export const CacheName = "catbox-couchbase";
export const DefaultTTL = 60 * 60 * 1000; //60 minutes in milliseconds

/**
 * A collection of caches used throughout the app.
 */
export const Caches: {userAuth: CacheConfig, shopTagConfig: CacheConfig} = {
    /**
     * A cache for storing user data used during auth checks.
     */
    userAuth: {
        segment: "user_auth_data",
        client: undefined,
        defaultTTL: DefaultTTL,
    },
    /**
     * A cache for storing a shop's tag configuration.
     */
    shopTagConfig: {
        segment: "shop_tag_config",
        client: undefined,
        defaultTTL: 24 * 60 * 60 * 1000, // Cache for 24 hours
    }
}

/**
 * Registers caches on the server and makes them available on the Caches object.
 */
export async function registerCaches(server: Server)
{
    Object.getOwnPropertyNames(Caches).forEach((prop, index, array) =>
    {
        const cache: CacheConfig = Caches[prop];
        cache.client = new Client(require("catbox-memory"), undefined);
        cache.client.start((error) =>
        {
            if (error)
            {
                console.error("Error starting cache client", error);
                
                throw error;
            }
        })
    })
}

/**
 * A promised function for getting a value from a catbox cache.
 */
export function getCacheValue<T>(cache: CacheConfig, key: string)
{
    return new Bluebird<CachedItem<T>>((resolve, reject) =>
    {
        cache.client.get<T>({id: key, segment: cache.segment}, (error, value) =>
        {
            if (error)
            { 
                return reject (error);
            }
            
            return resolve(value);
        })
    })
}

/**
 * A promised function for setting a value in a catbox cache.
 */
export function setCacheValue<T>(cache: CacheConfig, key: string, value: T)
{
    return new Bluebird<void>((resolve, reject) =>
    {
        cache.client.set({id: key, segment: cache.segment}, value, cache.defaultTTL, (error) =>
        {
            if (error)
            {
                reject(error);
            }
            
            resolve(undefined);
        })
    })
}

/**
 * A promised function for deleting a value in a catbox cache.
 */
export function deleteCacheValue<T>(cache: CacheConfig, key: string)
{
    return new Bluebird<void>((resolve, reject) =>
    {
        cache.client.drop({id: key, segment: cache.segment}, (error) =>
        {
            if (error)
            {
                reject(error);
            }
            
            resolve(undefined);
        });
    })
}