import React, { Component } from 'react';
import manifesto from 'manifesto.js';

import LinkButton from './LinkButton'
import QualityChips from './QualityChips'

export default class DisplayManifest extends Component {
    constructor(props) {
        console.log("CONS DM")
        super(props);
    }

    render() {
        var errorflag={};
        errorflag[0] = "";
        errorflag[1] = <div className="error_block">no images</div>;

        let showUrl = <span></span>
        if(this.props.settings.showUrl===true) {
          showUrl = <a href={this.props.url} target="_blank">
            {this.props.url.length>20?this.props.url.substring(0,30)+'...':this.props.url}
          </a>
        }

        let links = this.props.theme.openManifestLinks.map(link =>
          <LinkButton lang="en" link={link} theme={this.props.theme} uri={this.props.url} key={"LINK"+link}/>
        )

        let buttons = []
        if(this.props.theme.generalButtons.copyURL) {
          buttons.push(<button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={"ButtonCopyURL"}>COPY URL</button>)
        }
        if(this.props.theme.generalButtons.addToBasket) {
          buttons.push(<button onClick={() => this.props.addToBasket(this.props.id)} className="ButtonAddToBasket" key={"ButtonAddToBasket"}>ADD TO BASKET</button>)
        }

        console.log("SA "+this.props.url.startsWith("https"))
        console.log("url "+this.props.url)

        return (
            <div className="box">
                <div className="box_icon" style={{backgroundImage:`url(${this.props.thumb})`}}>
                  {errorflag[this.props.error]}
                </div>
                <div className="box_text">
                    {this.props.label}<br />
                    {showUrl}<QualityChips theme={this.props.theme} cors={this.props.cors} https={this.props.url.startsWith("https")} /><br />
                    {buttons}
                    {links}
                    <br />
                </div>
            </div>
        );
    }
}
