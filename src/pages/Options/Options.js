import React, { Component } from 'react'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import Theme from '../../themes/active/Theme.js'
import Defaults from '../../themes/active/Defaults.js'

import { v5 } from 'uuid'

import ManifestViewers from './components/ManifestViewers.js'
import CollectionViewers from './components/CollectionViewers.js'
import IgnoreDomains from './components/IgnoreDomains.js'

import packageJson from '../../../package.json'

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

class Options extends Component {

  constructor(props) {
    super()

    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)
    this.data={
      showUrl: true
    }

    this.state = {
    }

    this.themeVersion = chrome.runtime.getManifest().version
    this.softwareVersion = packageJson.version

    chrome.storage.onChanged.addListener( (changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

        if(namespace==="local" &&  key==="showUrl") {
          this.setState({showUrl:newValue})
        }

        // console.log(
        //   `Storage key "${key}" in namespace "${namespace}" changed.`,
        //   `Old value was "${oldValue}", new value is "${newValue}".`
        // )
      }
    });

  }

  upd() {
    this.data = Object.assign({},this.data,this.state)
    chrome.storage.local.set(this.data)
  }

  render() {

    // console.log({render_opts_with_state:this.state})

    return (
      <span>

        <div className="optionsHeader">
          { this.theme.optionsLogoImage ?
            <span>
              <img src={this.theme.optionsLogoImage} alt={this.theme.title} className="optionsLogoImage" /><br />
              {this.theme.optionsPunchline}
            </span>
            :
            <h2 className="App-title">Options: {this.theme.title}</h2>
          }
          { this.theme.optionsSecondaryLogoImage ? <img src={this.theme.optionsSecondaryLogoImage} alt={this.theme.title} className="optionsSecondaryLogoImage" /> : null }
        </div>
        <p>Version detektIIIF: {this.softwareVersion}</p>
        <p>Version Theme: {this.themeVersion}</p>

        <h2>Description</h2>

        {this.theme.optionsDescription}

        <Divider />

        <Accordion style={{border:'0',boxShadow:'none'}} disableGutters={true} defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{backgroundColor:'#fff',padding:'0 0',border:'0'}} >
            <h2>Options</h2>
          </AccordionSummary>
          <AccordionDetails style={{padding:'0'}}>
          <FormControlLabel
            control={
              <div className="optionsFloatRight"><Switch name="showUrl" defaultChecked={true} /></div>
            }
            label="View IIIF Manifest URLs"
            onChange={(e)=>{ this.setState({showUrl:e.target.checked}, this.upd) }}
            labelPlacement="start"
            style={{marginLeft:0,width:"90%"}}
          />
          </AccordionDetails>
        </Accordion>

        <ManifestViewers />

        <CollectionViewers />

        <Accordion style={{border:'0',boxShadow:'none'}} disableGutters={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{backgroundColor:'#fff',padding:'0 0',border:'0'}} >
            <h2>Advanced Settings</h2>
          </AccordionSummary>
          <AccordionDetails style={{padding:'0'}}>
            <IgnoreDomains />
          </AccordionDetails>
        </Accordion>

      </span>
    )
  }

}


export default Options
