import React, { Component } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

class Options extends Component {
  constructor(props) {
    super()
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
        <h1>DetektIIIF 2 Options</h1>
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
