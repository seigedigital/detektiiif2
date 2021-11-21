import React, { Component } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel';

import Theme from '../../themes/Selector.js'

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
      <div>
      <header className="App-header">
        <h2 className="App-title">Options: {this.theme.title}</h2>
        <small className="version">{chrome.runtime.getManifest().version}</small>
      </header>
        <FormControlLabel
              control={<Checkbox name="showUrls" defaultChecked={true} />}
              label="Show URLs"
              onChange={(e)=>{ this.data.showUrl=e.target.checked; this.upd(); }}
            />
      </div>
    )
  }

}

export default Options
