/// <reference path="./../../typings/typings.d.ts" />

import * as React from "react";
import * as reqwest from "reqwest";
import * as Promise from "bluebird";
import {DeliverSettings} from "gearworks";
import {render as renderComponent} from "react-dom";
import {AutoPropComponent} from "auto-prop-component";

export interface IProps extends React.Props<any>, DeliverSettings
{
    settings: DeliverSettings;
}

export interface IState extends DeliverSettings
{
    isSaving?: boolean;   
}

export class HomeForm extends AutoPropComponent<IProps, IState>
{
    constructor(props: IProps)
    {
        super(props);

        this.configureState(props, false);
    }
    
    private configureState(props: IProps, useSetState: boolean)
    {
        const state: IState = Object.assign({}, props.settings);
                
        if (!useSetState)
        {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }

    //#region Event handlers
 
    private save(e: React.MouseEvent<any>)
    {
        e.preventDefault();

        if (this.state.isSaving)
        {
            return;
        }

        this.getAndUpdateState((state) =>
        {
            state.isSaving = true;

            return state;
        })

        const req = reqwest<string>({
            url: "/api/v1/config",
            data: JSON.stringify(this.state),
            method: "PUT",
            contentType: "application/json",
            headers: {
                "Accept" : "application/json",
                "Content-Type" : "application/json",
            }
        });

        Promise.resolve(req).then((result) => ({})).catch((error) =>
        {
            alert("Something went wrong and your changes could not be saved. Please reload this page and try again.");

            console.error("Failed to save changes to user's configuration.", error);
        }).finally(() =>
        {
            this.getAndUpdateState((state) => {
                state.isSaving = false;

                return state;
            }) 
        })
    }

    private toggleCheckbox(e: React.FormEvent<HTMLInputElement>)
    {
        e.preventDefault();

        this.getAndUpdateState((state) => { 
            state.addPickerToCheckout = !state.addPickerToCheckout; 
            
            return state; 
        })
    }

    //#endregion

    public componentDidMount()
    {
        
    }
    
    public componentDidUpdate()
    {

    }
    
    public componentWillReceiveProps(props: IProps)
    {
        this.configureState(props, true);
    }

    public render()
    {
        const {addPickerToCheckout,allowChangeFromCheckout,format,label,isSaving} = this.state;

        return (
            <div className="row">
                <div className="col-md-6">
                    <form className="form form-horizontal well">
                        <div className="form-group">
                            <label className="control-label col-md-2">
                                {"Label:"}
                            </label>
                            <div className="col-md-10">
                                <input className="form-control" type="text" name="label" value={label} onChange={this.updateStateFromEvent((s, v) => s.label = v, false)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="control-label col-md-2">
                                {"Format:"}
                            </label>
                            <div className="col-md-10">
                                <div className="radio">
                                    <label>
                                        <input type="radio" name="dateFormat" value="mm/dd/yyyy" checked={format === "mm/dd/yyyy"} onChange={this.updateStateFromEvent((s, v) => s.format = "mm/dd/yyyy", false)}  />
                                        {`MM/DD/YYYY`}
                                    </label>
                                </div>
                                <div className="radio">
                                    <label>
                                        <input type="radio" name="dateFormat" value="dd/mm/yyyy" checked={format === "dd/mm/yyyy"} onChange={this.updateStateFromEvent((s, v) => s.format = "dd/mm/yyyy", false)} />
                                        {`DD/MM/YYYY`}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-md-10 col-md-offset-2">
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox" checked={addPickerToCheckout} onChange={this.toggleCheckbox} style={{"marginRight" : "5px"}} />
                                        {"Add date picker to post-checkout page."}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="form-footer">
                            <button type="button" className="btn btn-primary" onClick={(e) => this.save(e)}>
                                { isSaving ? "Updating" : "Update"}
                            </button>
                            {
                                !isSaving ? null :
                                <div className="progress">
                                    <div className="progress-bar progress-bar-striped active" role="progressbar" style={{"width": "70%"}}/>
                                </div>
                            }
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

{
    const config = JSON.parse(document.getElementById("configjson").innerHTML);

    renderComponent(<HomeForm {...config} />, document.getElementById("contenthost"));
}