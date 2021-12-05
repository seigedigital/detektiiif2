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
        super(props);
    }

    render() {

        let hashedurl=v5(this.props.url, '1b671a64-40d5-491e-99b0-d37347111f20')

        let showUrl = null
        if(this.props.settings.showUrl===true) {
          showUrl = <a href={this.props.url} target="_blank" key={`showurl-${hashedurl}`}>
            {this.props.url.length>20?this.props.url.substring(0,30)+'...':this.props.url}
          </a>
        }

        let links = this.props.theme.openManifestLinks.map(link =>
          <LinkButton lang="en" link={link} theme={this.props.theme} uri={this.props.url} key={`linkbutton-${link.url}-${hashedurl}`}  />
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

        return (
          <div className="ListItem" key={`listitem-${hashedurl}`}>
            <div className="ListItem-image" key={`listitem-image-${hashedurl}`}>
              <LazyLoadImage
                src={this.props.thumb}
                placeholder=<HourglassEmptyIcon sx={{color:'white'}} />
              />
            </div>
            <div className="ListItem-info" key={`listitem-info-${hashedurl}`}>
                {this.props.label}<br />
                {showUrl}<QualityChips theme={this.props.theme} cors={this.props.cors} hashedurl={hashedurl} https={this.props.url.startsWith("https")} key={`quality-chips-${hashedurl}`} /><br />
                {buttons}<br />
                {links}<br />
            </div>
          </div>
        )
    }
}
