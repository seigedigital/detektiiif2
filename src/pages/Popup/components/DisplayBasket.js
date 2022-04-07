import React, { Component } from 'react';
import manifesto from 'manifesto.js';

import LinkButton from './LinkButton'
import QualityChips from './QualityChips'
import { v4 } from 'uuid'
import { v5 } from 'uuid'

import { LazyLoadImage } from 'react-lazy-load-image-component';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default class DisplayBasket extends Component {
    constructor(props) {
        super(props);
    }

    render() {

      console.log(this.props)

        let hashedurl=v5(this.props.url, '1b671a64-40d5-491e-99b0-d37347111f20')

        console.log({hashedurl:hashedurl})

        let showUrl = null
        if(this.props.settings.showUrl===true) {
          showUrl = <a href={this.props.url} target="_blank" className="URL" key={`showurl-${hashedurl}`}>
            {this.props.url}
          </a>
        }

        let links = []
        for(let key in this.props.settings.openManifestLinks) {
          let link = Object.assign({},this.props.settings.openManifestLinks[key])
          if(link.tabBasket) {
            let bgcolor = link.backgroundColor===undefined?false:link.backgroundColor
            links.push(
                <LinkButton tooltiptitle="Open Manifest" lang="en" bgcolor={bgcolor} link={link} theme={this.props.theme} uri={this.props.url} key={`linkbutton-${v5(JSON.stringify(link),'1b671a64-40d5-491e-99b0-d37347111f20')}-${hashedurl}`}  />
            )
          }
        }

        let buttons = []

        // if(this.props.theme.generalButtons.copyURL) {
        //   buttons.push(<button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >COPY URL</button>)
        // }

        if(this.props.theme.generalButtons.removeFromBasket!==false) {
          buttons.push(
            <Tooltip title="Remove manifest" key={v4()} >{
              this.props.theme.trashcanImage ?
                    <IconButton color="primary" aria-label="Basket" component="span" onClick={() => this.props.removeFromBasket(this.props.id)} key={`rembutton-${hashedurl}`} >
                      <img src={this.props.theme.trashcanImage}  className="iconSize" />
                    </IconButton>
                  :
                  <button onClick={() => this.props.removeFromBasket(this.props.id)} className="ButtonRemoveFromBasket" key={`rembutton-${hashedurl}`} >
                    Remove from basket
                  </button>}
            </Tooltip>
          )
        }

        return (
          <div className="ListItem" key={`listitem-${hashedurl}`}>
            <div className="ListItem-image" key={`listitem-image-${hashedurl}`}>
              <LazyLoadImage
                src={this.props.thumb}
                placeholder=<HourglassEmptyIcon sx={{color:'white'}}
                key={`listitem-lazyimage-${hashedurl}`} />
              />
            </div>
            <div className="ListItem-info" key={`listitem-info-${hashedurl}`}>
              <span className="truncated" key={`listitem-info-label-${hashedurl}`}>
                {this.props.label}
              </span>
              <span className="truncated" key={`listitem-info-url-${hashedurl}`}>
                {showUrl}<br />
              </span>
              {links}<br />
              {buttons}<br />
            </div>
          </div>
        )

    }

}
