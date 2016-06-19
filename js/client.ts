/// <reference path="./../typings/typings.d.ts" />

import {DeliverSettings} from "gearworks";

export class DeliverOn
{
    constructor(config: DeliverSettings)
    {
        console.log("Starting Deliver On with settings", config);

    }
}

// Make the class available to the browser window
self["DeliverOn"] = DeliverOn;