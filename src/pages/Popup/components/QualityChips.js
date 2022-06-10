import React, { Component } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import { v4 } from 'uuid'

export default class QualityChips extends Component {
  constructor(props) {
      super(props);
  }

  render() {

    let qmessages= [
      "No problems found.",
      "No CORS permission.",
      "No SSL encryption (HTTPS).",
      "No CORS permission nor SSL encryption (HTTPS).",
      "URL and ID not identical.",
      "URL and ID not identical and no CORS permission.",
      "URL and ID not identical and no SSL encryption (HTTPS).",
      "URL and ID not identical and no CORS permission nor SSL encryption (HTTPS)"
    ]

    let qcode = (this.props.cors===true?0:1) + (this.props.https===true?0:2) + (this.props.urlid===true?0:4)

    let hashedurl = this.props.hashedurl

    let chips = []

    if(this.props.theme.qualityChips.cors
      && !( this.props.cors && this.props.theme.qualityChips.hideok )) {
      chips.push(
        <Tooltip title={this.props.cors?"OK":qmessages[1]} key={`qc-cors-${hashedurl}`}>
          <Chip label="C" size="small" color={this.props.cors?'success':'error'} key={`corschip-${hashedurl}`} />
        </Tooltip>
      )
    }

    if(this.props.theme.qualityChips.https
      && !( this.props.https && this.props.theme.qualityChips.hideok )) {
      chips.push(
        <Tooltip title={this.props.https?"OK":qmessages[2]} key={`qc-https-${hashedurl}`}>
          <Chip label="S" size="small" color={this.props.https?'success':'error'} key={`httpschip-${hashedurl}`} />
        </Tooltip>)
    }

    if(this.props.theme.qualityChips.urlid
      && !( this.props.urlid && this.props.theme.qualityChips.hideok )) {
      chips.push(
        <Tooltip title={this.props.urlid?"OK":qmessages[4]} key={`qc-urlid-${hashedurl}`}>
          <Chip label="ID" size="small" color={this.props.urlid?'success':'error'} key={`urlidchip-${hashedurl}`} />
        </Tooltip>)
    }

    if(this.props.theme.qualityChips.combined) {
      let status = (qcode===0)
      let msg = qmessages[qcode]
      chips.push(
        <Tooltip title={msg} key={`combinedchiptt-${hashedurl}`}>
          <img src={status ? this.props.theme.greenDotImage : this.props.theme.redDotImage} className={`iconSize Quality-Chip`} key={`combinedchip-${hashedurl}`} />
        </Tooltip>
      )
    }

    return(
      <span style={{display:'inline',marginRight:'4px'}} key={`span-${hashedurl}`}>
        {chips}
      </span>
    )
  }


}
