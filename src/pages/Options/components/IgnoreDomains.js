import React, { Component } from 'react'

import TextField from '@mui/material/TextField'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

import Theme from '../../../themes/active/Theme.js'
import Defaults from '../../../themes/active/Defaults.js'

import { v5 } from 'uuid'


class IgnoreDomains extends Component {

  constructor(props) {
    super()

    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)
    this.data={
      ignoreDomains: this.defaults.ignoreDomains
    }

    this.state = {
      ignoreDomains: []
    }

    chrome.storage.local.get('ignoreDomains', (data) => {
      if(data.ignoreDomains!==undefined) {
        this.setState({ignoreDomains:data.ignoreDomains})
      } else {
        this.setState({ignoreDomains:this.defaults.ignoreDomains})
      }
    })

    chrome.storage.onChanged.addListener( (changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

        if(namespace==="local" &&  key==="ignoreDomains") {
          this.setState({ignoreDomains:newValue})
        }

        console.log(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`
        );
      }
    });

  }

  upd() {
    this.data = Object.assign({},this.data,this.state)
    chrome.storage.local.set(this.data)
  }

  render() {

    return (

        <span>
          <h3>Exclude Domains</h3>
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
            onClick={() => { this.setState({ignoreDomains:this.defaults.ignoreDomains}, this.upd) }}
          >
            Reset Defaults
          </Button>
        </span>
    )
  }

}


export default IgnoreDomains
