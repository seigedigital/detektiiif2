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

    let hashedurl = this.props.hashedurl

    let chips = []

    if(this.props.theme.qualityChips.cors) {
      chips.push(<Chip label="CORS" size="small" color={this.props.cors?'success':'error'} key={`corschip-${hashedurl}`} />)
    }

    if(this.props.theme.qualityChips.https) {
      chips.push(<Chip label="HTTPS" size="small" color={this.props.https?'success':'error'} key={`httpschip-${hashedurl}`} />)
    }

    if(this.props.theme.qualityChips.combined) {
      let status = this.props.https===true && this.props.cors===true
      let msg = (this.props.cors===true?"CORS OK, ":"CORS NOT OK, ")+(this.props.https===true?"HTTPS OK":"NO HTTPS")
      chips.push(
        <Tooltip title={msg} key={`combinedchiptt-${hashedurl}`}>
          <img src={status ? this.props.theme.greenDotImage : this.props.theme.redDotImage} className="iconSize" key={`combinedchip-${hashedurl}`} />
        </Tooltip>
      )
    }

    return(
      <Stack direction="row" spacing={1} component="span" style={{display:'inline'}} key={v4()}>
        {chips}
      </Stack>
    )
  }


}
