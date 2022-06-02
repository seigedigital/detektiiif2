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
            {this.props.url}
          </a>
        }

        let links = []
        // for(let key in this.props.theme.openManifestLinks) {
        //   let link = this.props.theme.openManifestLinks[key]
        for(let key in this.props.settings.openManifestLinks) {
          let link = this.props.settings.openManifestLinks[key]
          if(link.tabManifests) {
            links.push(
                <LinkButton lang="en" link={link} theme={this.props.theme} uri={this.props.url} key={`linkbutton-${link.url}-${hashedurl}`}  tooltiptitle={false}/>
            )
          }
        }

        let buttons = []
        if(this.props.theme.generalButtons.copyURL) {
          buttons.push(
            <Tooltip title="Copy URL to clipboard" key={`tt-copy-${hashedurl}`}>
              <button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >Copy URL</button>
            </Tooltip>
          )
        }
        if(this.props.theme.generalButtons.addToBasket) {
          buttons.push(
            <Tooltip title={"Add manifest to "+this.props.theme.basketName} key={`tt-add-${hashedurl}`}>
              <button onClick={() => this.props.addToBasket(this.props.id)} className="ButtonAddToBasket" key={`addbutton-${hashedurl}`} >Add to {this.props.theme.basketName}</button>
            </Tooltip>
          )
        }
        let info = null
        if(this.props.theme.optionsSwitches.viewManifestInfo===true) {
          info =  <Tooltip title={this.props.theme.texts.manifestInfoIcon}>
                    <img src={this.props.theme.infoImage} className="iconSize" />
                  </Tooltip>
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
                <span className="truncated" key={`listitem-info-label-${hashedurl}`}>
                  {this.props.label}
                </span>
                <span className="truncated" key={`listitem-info-url-${hashedurl}`}>
                  <QualityChips
                    theme={this.props.theme}
                    cors={this.props.cors}
                    hashedurl={hashedurl}
                    https={this.props.url.startsWith("https")}
                    urlid={this.props.url===this.props.id}
                    key={`quality-chips-${hashedurl}`}
                  />
                  {showUrl}
                </span>
                {buttons}
                {links}
                <br />
                {info}
            </div>
          </div>
        )
    }
}
