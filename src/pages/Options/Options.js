import React, { Component } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Button from '@mui/material/Button';

import Theme from '../../themes/active/Theme.js'
import Defaults from '../../themes/active/Defaults.js'

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

class Options extends Component {
  constructor(props) {
    super()
    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)
    this.data={
      showUrl: true,
      ignoreDomains: this.defaults.ignoreDomains
    }

    this.state = {
      ignoreDomains: []
    }

    chrome.storage.sync.get('ignoreDomains', (data) => {
      if(data.ignoreDomains!==undefined) {
        this.setState({ignoreDomains:data.ignoreDomains})
      } else {
        this.setState({ignoreDomains:this.defaults.ignoreDomains})
      }
    })

  }

  upd() {
    this.data = Object.assign({},this.data,this.state)
    console.log({DATA:this.data, STATE:this.state})
    chrome.storage.sync.set(this.data)
  }

  render() {
    return (
      <span>
      <div className="optionsHeader">
        { this.theme.optionsLogoImage ?
          <span>
            <img src={this.theme.optionsLogoImage} alt={this.theme.title} className="optionsLogoImage" />
            {this.theme.optionsPunchline}
          </span>
          :
          <h2 className="App-title">Options: {this.theme.title}</h2>
        }
      </div>
      <h2>Description</h2>
      {this.theme.optionsDescription}
      <p>Version: {chrome.runtime.getManifest().version}</p>
      <div className="optionsEntry">
        <FormControlLabel
              control={
                <div className="optionsFloatRight"><Switch name="showUrls" defaultChecked={true} /></div>
              }
              label="View IIIF Manifest URLs"
              onChange={(e)=>{ this.data.showUrl=e.target.checked; this.upd(); }}
              labelPlacement="start"
              style={{marginLeft:0,width:"90%"}}
            />
      </div>
      <div className="optionsEntry">
        <FormControlLabel
              control={
                <div className="optionsFloatRight"><Switch name="showUrls" defaultChecked={true} /></div>
              }
              label="Universal Viewer (ZB Zürich)"
              onChange={(e)=>{ }}
              labelPlacement="start"
              style={{marginLeft:0,width:"90%"}}
            />
      </div>

      <h2>Advanced Settings</h2>

      <div className="optionsEntry">

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={{backgroundColor:'#f8f8f8'}}
        >
          <Typography>Ignore Domains</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            id="filled-textarea"
            placeholder="Placeholder"
            multiline
            maxRows={10}
            variant="outlined"
            defaultValue={this.state.ignoreDomains.join('\n')}
            style={{marginLeft:0,width:"90%"}}
            onChange={(e)=>{ this.setState({ignoreDomains:e.target.value.split('\n')}, this.upd) }}
          />
          <br />
          <br />
          <Button variant="outlined" size="small" color="error"
            onClick={() => { this.setState({ignoreDomains:this.defaults.ignoreDomains}), this.upd }}
          >
            Reset Defaults
          </Button>
        </AccordionDetails>
      </Accordion>

      </div>

      </span>
    )
  }

}

//             onChange={(e)=>{ this.data.ignoreDomains=e.target.value.split('\n'); this.upd(); }}


export default Options
