import React, { Component } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

export default class QualityChips extends Component {
  constructor(props) {
      super(props);
  }

  render() {

    let chips = []

    if(this.props.theme.qualityChips.cors) {
      chips.push(<Chip label="CORS" size="small" color={this.props.cors?'success':'error'} key={"CORSCHIP"} />)
    }

    if(this.props.theme.qualityChips.https) {
      chips.push(<Chip label="HTTPS" size="small" color={this.props.https?'success':'error'} key={"HTTPSCHIP"} />)
    }

    if(this.props.theme.qualityChips.combined) {
      console.log("TTTOOOPPP")
      console.log({thisprops:this.props})
      let status = this.props.https===true && this.props.cors===true
      let msg = (this.props.cors===true?"CORS OK, ":"CORS NOT OK, ")+(this.props.https===true?"HTTPS OK":"NO HTTPS")
      chips.push(
        <Tooltip title={msg} key={"COMBINEDCHIPTOOLTIP"}>
          <img src={status ? this.props.theme.greenDotImage : this.props.theme.redDotImage} className="qualityChip" key={"COMBINEDCHIP"} />
        </Tooltip>
      )
    }

    return(
      <Stack direction="row" spacing={1} component="span" style={{display:'inline'}}>
        {chips}
      </Stack>
    )
  }


}
