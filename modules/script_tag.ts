
import * as config from "./config";
import {Routes} from "../routes/tag/tag-routes";
import {ScriptTag, ScriptTags} from "shopify-prime";

export async function createTag(shopDomain: string, shopToken: string, shopId: number)
{
    const service = new ScriptTags(shopDomain, shopToken);
    const tag = await service.create({
        src: `https://${config.Domain}${Routes.GetTag}?shopId=${shopId}`,
        event: "onload",
    });
}