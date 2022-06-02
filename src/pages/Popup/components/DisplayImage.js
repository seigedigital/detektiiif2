import React, { Component } from 'react';
import manifesto from 'manifesto.js';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import QualityChips from './QualityChips'
import Tooltip from '@mui/material/Tooltip';

import { v5 } from 'uuid'


export default class DisplayImage extends Component {
    constructor(props) {
        super(props);
        // this.copyUrl = this.copyUrl.bind(this);
    }

    render() {

      let hashedurl=v5(this.props.url, '1b671a64-40d5-491e-99b0-d37347111f20')

        var corsflag={};
        corsflag[true.toString()] = <span className="green_block">CORS</span>
        corsflag["1"] = <span className="green_block">CORS</span>
        corsflag[false.toString()] = <span className="red_block">CORS</span>
        corsflag["0"] = <span className="red_block">CORS</span>
        corsflag["2"] = <span className="grey_block">CORS</span>

        var httpsflag={};
        httpsflag[true.toString()] = <span className="green_block">HTTPS</span>
        httpsflag["1"] = <span className="green_block">HTTPS</span>
        httpsflag[false.toString()] = <span className="red_block">HTTPS</span>
        httpsflag["0"] = <span className="red_block">HTTPS</span>
        httpsflag["2"] = <span className="grey_block">HTTPS</span>

        var errorflag={};
        errorflag[0] = "";
        errorflag[1] = <div className="error_block">no images</div>;

        let showUrl = null
        if(this.props.settings.showUrl===true) {
          showUrl = <a href={this.props.url} className="URL" target="_blank" key={`showurl-${hashedurl}`}>
            {this.props.url}
          </a>
        }

        <div className="box_icon" style={{backgroundImage:`url(${this.props.thumb})`}}>
          {errorflag[this.props.error]}
        </div>

        return (
          <div className="ListItem" key={`listitem-${hashedurl}`}>
            <div className="ListItem-image" key={`listitem-image-${hashedurl}`}>
            <LazyLoadImage
              height={"100"}
              src={this.props.thumb}
              placeholder=<HourglassEmptyIcon sx={{color:'white'}} key={`listitem-lazyimage-${hashedurl}`} />
            />
            </div>
            <div className="ListItem-info" key={`listitem-info-${hashedurl}`}>
            <span className="truncated" key={`listitem-info-url-${hashedurl}`}>
                  <QualityChips
                    theme={this.props.theme}
                    cors={this.props.cors}
                    hashedurl={hashedurl}
                    https={this.props.url.startsWith("https")}
                    urlid={this.props.url.replace('/?info\.json','')===this.props.id}
                    key={`quality-chips-${hashedurl}`}
                  />
                  {showUrl}
                </span>
                <Tooltip title="Copy URL to clipboard" key={`tt-copy-${hashedurl}`}>
                  <button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >Copy URL</button>
                </Tooltip>
            </div>
          </div>
        );
    }
}
