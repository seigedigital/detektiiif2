import React, { Component } from 'react';
import manifesto from 'manifesto.js';
import { v5 } from 'uuid'
import Tooltip from '@mui/material/Tooltip';
import QualityChips from './QualityChips'

export default class DisplayCollection extends Component {
    constructor(props) {
        super(props);
        // this.copyUrl = this.copyUrl.bind(this);
    }

    render() {
        let hashedurl=v5(this.props.url, '1b671a64-40d5-491e-99b0-d37347111f20')

        return (
          <div className="ListItem" key={`listitem-${hashedurl}`}>
            <div className="ListItem-image" key={`listitem-image-${hashedurl}`}>
              <div className="CollectionImage">{"{ }"}</div>
            </div>
            <div className="ListItem-info" key={`listitem-info-${hashedurl}`}>
              <span className="truncated" key={`listitem-info-label-${hashedurl}`}>
                {this.props.label}<br />
              </span>
              <a href={this.props.url} target="_blank">{this.props.url}</a><br />
              <QualityChips
                theme={this.props.theme}
                cors={this.props.cors}
                hashedurl={hashedurl}
                https={this.props.url.startsWith("https")}
                urlid={this.props.url.replace('/?info\.json','')===this.props.id}
                key={`quality-chips-${hashedurl}`}
              />
              <Tooltip title="Copy URL to clipboard" key={`tt-copy-${hashedurl}`}>
                <button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >Copy URL</button>
              </Tooltip>
            </div>
          </div>
        );
    }
}
