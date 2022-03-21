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
      "HTTP and CORS present.",
      "No CORS permission.",
      "No SSL encryption (HTTPS).",
      "No CORS permission nor SSL encryption (HTTPS)."
    ]

    let qcode = (this.props.cors===true?0:1) + (this.props.https===true?0:2)

    let hashedurl = this.props.hashedurl

    let chips = []

    if(this.props.theme.qualityChips.cors) {
      chips.push(<Chip label="CORS" size="small" color={this.props.cors?'success':'error'} key={`corschip-${hashedurl}`} />)
    }

    if(this.props.theme.qualityChips.https) {
      chips.push(<Chip label="HTTPS" size="small" color={this.props.https?'success':'error'} key={`httpschip-${hashedurl}`} />)
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
      <span style={{display:'inline'}} key={`span-${hashedurl}`}>
        {chips}
      </span>
    )
  }


}
