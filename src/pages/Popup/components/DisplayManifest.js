import React, { Component } from 'react';
import manifesto from 'manifesto.js';

import LinkButton from './LinkButton'
import QualityChips from './QualityChips'
import { v4 } from 'uuid'
import { v5 } from 'uuid'

import { LazyLoadImage } from 'react-lazy-load-image-component';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import Tooltip from '@mui/material/Tooltip';

export default class DisplayManifest extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        let hashedurl=v5(this.props.url, '1b671a64-40d5-491e-99b0-d37347111f20')

        let showUrl = null
        if(this.props.settings.showUrl===true) {
          showUrl = <a href={this.props.url} className="URL" target="_blank" key={`showurl-${hashedurl}`}>
            {this.props.url.length>50?this.props.url.substring(0,60)+'...':this.props.url}
          </a>
        }

        let links = []
        // for(let key in this.props.theme.openManifestLinks) {
        //   let link = this.props.theme.openManifestLinks[key]
        for(let key in this.props.settings.openManifestLinks) {
          let link = this.props.settings.openManifestLinks[key]
          if(link.tabManifests) {
            links.push(
              <LinkButton lang="en" link={link} theme={this.props.theme} uri={this.props.url} key={`linkbutton-${link.url}-${hashedurl}`}  />
            )
          }
        }

        let buttons = []
        if(this.props.theme.generalButtons.addToBasket) {
          buttons.push(<button onClick={() => this.props.addToBasket(this.props.id)} className="ButtonAddToBasket" key={`addbutton-${hashedurl}`} >ADD TO BASKET</button>)
        }
        if(this.props.theme.generalButtons.copyURL) {
          buttons.push(<button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >COPY URL</button>)
        }

        return (
          <div className="ListItem" key={`listitem-${hashedurl}`}>
            <div className="ListItem-image" key={`listitem-image-${hashedurl}`}>
              <LazyLoadImage
                src={this.props.thumb}
                placeholder=<HourglassEmptyIcon sx={{color:'white'}} key={`listitem-lazyimage-${hashedurl}`} />
              />
            </div>
            <div className="ListItem-info" key={`listitem-info-${hashedurl}`}>
                {this.props.label}<br />
                {showUrl}<QualityChips theme={this.props.theme} cors={this.props.cors} hashedurl={hashedurl} https={this.props.url.startsWith("https")} key={`quality-chips-${hashedurl}`} /><br />
                {buttons}
                {links}
                <br />
                <Tooltip title={this.props.theme.texts.manifestInfoIcon}>
                  <img src={this.props.theme.infoImage} className="iconSize" />
                </Tooltip>
            </div>
          </div>
        )
    }
}
