import React, { Component } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import Theme from '../../themes/active/Theme.js'

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

class Options extends Component {
  constructor(props) {
    super()
    this.theme = new Theme()

    this.upd = this.upd.bind(this)
    this.data={
      showUrl: true
    }
    this.upd()
  }

  upd() {
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
      </span>
    )
  }

}

export default Options
