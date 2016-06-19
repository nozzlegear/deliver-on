
import * as config from "./config";

/**
 * Returns the app's domain according to the settings passed to config on startup. Will always return config.Domain when live.
 * @param preferLocalhost Whether the function should return the localhost domain before the ngrok domain. Useful when using the domain in a Shopify redirect_uri where domains are hardcoded.
 */
export function getDomain(preferLocalhost: boolean)
{
    if (config.isLive)
    {
        return config.Domain;
    }

    if (preferLocalhost || !config.NgrokDomain)
    {
        return `${config.Host}:${config.Port}`;
    }

    return config.NgrokDomain;
}