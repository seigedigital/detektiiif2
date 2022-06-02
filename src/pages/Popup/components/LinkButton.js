import React, { Component } from 'react';
import { v4 } from 'uuid'
import { v5 } from 'uuid'
import Tooltip from '@mui/material/Tooltip';

export default class LinkButton extends Component {
  constructor(props) {
      super(props);
  }

  render() {

    let hashedurl=v5(this.props.uri, '1b671a63-40d3-4913-99b3-da01ff1f3343')
    let hashedlabel=v5(this.props.link.label['en'],'1b671a63-40d3-4913-99b3-da01ff1f3343')

    return(
      <Tooltip title={
        this.props.tooltiptitle ? this.props.tooltiptitle : this.props.link.label['en']
      } key={`tt-innerlinkbutton-${hashedlabel}-${hashedurl}`}>
        <button
          onClick={() => { window.open(`${(this.props.link.url.replace("%%%URI%%%",this.props.uri))}`,'_blank') } }
          className="ButtonOpenManifest"
          style={this.props.bgcolor ? {backgroundColor:this.props.bgcolor} : null}
        >
        { (this.props.lang in this.props.link.label) ? this.props.link.label[this.props.lang] : this.props.link.label['en'] }
        </button>
      </Tooltip>
    )
    // return(
    //   <a
    //     href={this.props.link.url.replace("%%%URI%%%",this.props.uri)}
    //     target="_blank"
    //     className="ButtonOpenManifest"
    //     key={`innerlinkbutton-${hashedlabel}-${hashedurl}`}
    //     style={this.props.bgcolor?{backgroundColor:this.props.bgcolor}:null}
    //   >
    //   { (this.props.lang in this.props.link.label) ? this.props.link.label[this.props.lang] : this.props.link.label['en'] }
    //   </a>
    // )
  }


}
