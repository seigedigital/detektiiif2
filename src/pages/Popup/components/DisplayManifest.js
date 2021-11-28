import React, { Component } from 'react';
import manifesto from 'manifesto.js';

import LinkButton from './LinkButton'
import QualityChips from './QualityChips'
import { v4 } from 'uuid'
import { v5 } from 'uuid'

import { LazyLoadImage } from 'react-lazy-load-image-component';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export default class DisplayManifest extends Component {
    constructor(props) {
        console.log("CONS DM")
        super(props);
    }

    render() {

        const MY_NAMESPACE = '1b671a63-40d3-4913-99b3-da01ff1f3343'
        let hashedurl=v5(this.props.url, MY_NAMESPACE)

        var errorflag={};
        errorflag[0] = "";
        errorflag[1] = <div className="error_block">no images</div>;

        let showUrl = null
        if(this.props.settings.showUrl===true) {
          showUrl = <a href={this.props.url} target="_blank" key={`showurl-${hashedurl}`}>
            {this.props.url.length>20?this.props.url.substring(0,30)+'...':this.props.url}
          </a>
        }

        let links = this.props.theme.openManifestLinks.map(link =>
          <LinkButton lang="en" link={link} theme={this.props.theme} uri={this.props.url} key={`linkbutton-${link}-${hashedurl}`}  />
        )

        let buttons = []
        if(this.props.theme.generalButtons.copyURL) {
          buttons.push(<button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >COPY URL</button>)
        }
        if(this.props.theme.generalButtons.addToBasket) {
          buttons.push(<button onClick={() => this.props.addToBasket(this.props.id)} className="ButtonAddToBasket" key={`addbutton-${hashedurl}`} >ADD TO BASKET</button>)
        }

        console.log("SA "+this.props.url.startsWith("https"))
        console.log("url "+this.props.url)

        // <div className="box_icon" style={{backgroundImage:`url(${this.props.thumb})`}} key={`errorflag-div`}>
        //   {errorflag[this.props.error]}
        // </div>

        return (
            <div className="box" key={v4()}>
                <LazyLoadImage
                  src={this.props.thumb}
                  placeholder=<HourglassEmptyIcon />
                />
                <div className="box_text" key={`box-text-div`}>
                    {this.props.label}<br />
                    {showUrl}<QualityChips theme={this.props.theme} cors={this.props.cors} hashedurl={hashedurl} https={this.props.url.startsWith("https")} key={`quality-chips`}/><br />
                    {buttons}
                    {links}
                    <br />
                </div>
            </div>
        )
    }
}
