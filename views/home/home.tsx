/// <reference path="./../../typings/typings.d.ts" />

import * as React from "react";
import {Crumb} from "../crumb";
import {DefaultContext} from "gearworks";
import Layout, {LayoutProps} from "../layout";
import {IProps as Settings} from "deliver-on-client";
import {IProps as ScriptProps} from "../../js/home/home";

export interface IProps extends LayoutProps, ScriptProps
{
    shopName: string;
    
    settings: Settings;
}

export default function HomePage(props: IProps & DefaultContext)
{
    return (
        <Layout {...props} scripts={["wwwroot/js/shared.js", "/wwwroot/js/home/home.js"]}>
            <section id="home">
                <h1 className="page-title">
                    {"Your Dashboard"}
                </h1>
                <p>
                    {`Thanks for installing ${props.appName}! We've automatically added a delivery date selector to your store's cart page. In almost all cases the delivery date selector should blend right in with your store's cart page, but please contact us at support@deliveron.xyz in the rare case that it does not. We'd be happy to help.`}
                </p>
                <section id="contenthost" />
                <script id="configjson" type="application/json" dangerouslySetInnerHTML={{__html: JSON.stringify({settings: props.settings})}} />
            </section>
        </Layout>
    );
}