import React, { Component } from 'react';
import manifesto from 'manifesto.js';

import LinkButton from './LinkButton'
import QualityChips from './QualityChips'
import { v4 } from 'uuid'
import { v5 } from 'uuid'

import { LazyLoadImage } from 'react-lazy-load-image-component';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import IconButton from '@mui/material/IconButton';

export default class DisplayBasket extends Component {
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
          <LinkButton lang="en" link={link} theme={this.props.theme} uri={this.props.url} key={`linkbutton-${v5(link,'1b671a64-40d5-491e-99b0-d37347111f20')}-${hashedurl}`}  />
        )

        let buttons = []

        // if(this.props.theme.generalButtons.copyURL) {
        //   buttons.push(<button onClick={() => this.props.copyUrl(this.props.url)} className="ButtonCopyURL" key={`copybutton-${hashedurl}`} >COPY URL</button>)
        // }

        if(this.props.theme.generalButtons.removeFromBasket!==false) {
          buttons.push(<br key={v4()} />)
          buttons.push(
            this.props.theme.generalButtons===true ?
              (
                <button onClick={() => this.props.removeFromBasket(this.props.url)} className="ButtonRemoveFromBasket" key={`rembutton-${hashedurl}`} >
                  REMOVE FROM BASKET
                </button>
              )
              :
              (
                <IconButton color="primary" aria-label="Basket" component="span" onClick={() => this.props.removeFromBasket(this.props.url)} key={`rembutton-${hashedurl}`} >
                  <img src={this.props.theme.generalButtons.removeFromBasket} className="iconSize" />
                </IconButton>
              )
          )
        }

        console.log("SA "+this.props.url.startsWith("https"))
        console.log("url "+this.props.url)

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
                {this.props.label}<br key={v4()}/>
                {showUrl}
                {buttons}<br key={v4()}/>
                {links}<br key={v4()}/>
            </div>
          </div>
        )
        // return (
        //   <div className="ListItem" key={`listitem-${hashedurl}`}>
        //     <div className="ListItem-image" key={`listitem-image-${hashedurl}`}>
        //       <LazyLoadImage
        //         src={this.props.thumb}
        //         placeholder=<HourglassEmptyIcon sx={{color:'white'}}
        //         key={`listitem-lazyimage-${hashedurl}`} />
        //       />
        //     </div>
        //     <div className="ListItem-info" key={`listitem-info-${hashedurl}`}>
        //         {this.props.label}<br key={v4()}/>
        //         {showUrl}
        //         {buttons}<br key={v4()}/>
        //         {links}<br key={v4()}/>
        //     </div>
        //   </div>
        // )
    }

    // render() {
    //     var corsflag={};
    //     corsflag[true.toString()] = <span className="green_block">CORS</span>
    //     corsflag["1"] = <span className="green_block">CORS</span>
    //     corsflag[false.toString()] = <span className="red_block">CORS</span>
    //     corsflag["0"] = <span className="red_block">CORS</span>
    //     corsflag["2"] = <span className="grey_block">CORS</span>
    //
    //     var httpsflag={};
    //     httpsflag[true.toString()] = <span className="green_block">HTTPS</span>
    //     httpsflag["1"] = <span className="green_block">HTTPS</span>
    //     httpsflag[false.toString()] = <span className="red_block">HTTPS</span>
    //     httpsflag["0"] = <span className="red_block">HTTPS</span>
    //     httpsflag["2"] = <span className="grey_block">HTTPS</span>
    //
    //     var errorflag={};
    //     errorflag[0] = "";
    //     errorflag[1] = <div className="error_block">no images</div>;
    //
    //     // alert("DM: "+this.props.label);
    //     // alert("DM "+JSON.stringify(this.props));
    //
    //     // need more logic here: URL vs ID
    //     // <a href={this.props.id} target="_blank">{this.props.id}</a><br />
    //
    //     return (
    //         <div className="box">
    //             <div className="box_icon" style={{backgroundImage:`url(${this.props.thumb})`}}>
    //               {errorflag[this.props.error]}
    //             </div>
    //             <div className="box_text">
    //                 {this.props.label}<br />
    //                 <a href={this.props.url} target="_blank">{this.props.url}</a><br />
    //                 {corsflag[this.props.cors.toString()]}
    //                 {httpsflag[this.props.url.startsWith("https").toString()]}<br />
    //                 <button onClick={() => this.props.copyUrl(this.props.url)}>COPY URL</button>
    //                 <button onClick={() => this.props.removeFromBasket(this.props.url)}>REM FROM BASKET</button>
    //                 <a href={'https://universalviewer.io/uv.html?manifest='+this.props.url} target="_blank">UV</a>&nbsp;
    //                 <a href={'https://demo.tify.rocks/demo.html?manifest='+this.props.url} target="_blank">TIFY</a>&nbsp;
    //                 <a href={'https://manducus.net/m3?manifest='+this.props.url} target="_blank">M3</a>
    //             </div>
    //         </div>
    //     );
    // }
}
