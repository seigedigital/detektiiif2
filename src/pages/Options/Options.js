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

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import Divider from '@mui/material/Divider';

import Button from '@mui/material/Button';

import Theme from '../../themes/active/Theme.js'
import Defaults from '../../themes/active/Defaults.js'

import { v5 } from 'uuid'


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

class Options extends Component {
  constructor(props) {
    super()
    this.setOpenManifestLinkURL = this.setOpenManifestLinkURL.bind(this)
    this.setOpenManifestLinkLang = this.setOpenManifestLinkLang.bind(this)
    this.setOpenManifestLinkRemove = this.setOpenManifestLinkRemove.bind(this)
    this.setOpenManifestLinkRestoreDefaults = this.setOpenManifestLinkRestoreDefaults.bind(this)

    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)
    this.data={
      showUrl: true,
      ignoreDomains: this.defaults.ignoreDomains,
      openManifestLinks: Object.assign({},this.theme.openManifestLinks)
    }

    this.state = {
      ignoreDomains: [],
      openManifestLinks: {}
    }

    chrome.storage.sync.get('ignoreDomains', (data) => {
      if(data.ignoreDomains!==undefined) {
        this.setState({ignoreDomains:data.ignoreDomains})
      } else {
        this.setState({ignoreDomains:this.defaults.ignoreDomains})
      }
    })

    chrome.storage.sync.get('openManifestLinks', (data) => {
      if(data.openManifestLinks!==undefined) {
        this.setState({openManifestLinks:data.openManifestLinks})
      } else {
        this.setState({openManifestLinks:this.theme.openManifestLinks})
      }
    })

    chrome.storage.onChanged.addListener( (changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

        if(namespace==="sync" &&  key==="showUrl") {
          this.setState({showUrl:newValue})
        }

        if(namespace==="sync" &&  key==="openManifestLinks") {
          this.setState({openManifestLinks:Object.assign({},newValue)})
        }

        console.log(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`
        );
      }
    });

  }

  setOpenManifestLinkURL(key,value) {
    let data = this.data.openManifestLinks
    if(data===undefined) {
      let data = this.theme.openManifestLinks
    }
    data[key].url = value
    this.setState({openManifestLinks:data}, this.upd)
  }

  setOpenManifestLinkLang(key,value,lang) {
    let data = this.data.openManifestLinks
    if(data===undefined) {
      let data = this.theme.openManifestLinks
    }
    data[key].label[lang] = value
    this.setState({openManifestLinks:data}, this.upd)
  }

  setOpenManifestLinkRemove(key) {
    let data = this.data.openManifestLinks
    if(data===undefined) {
      let data = this.theme.openManifestLinks
    }
    delete data[key]
    this.setState({openManifestLinks:data}, this.upd)
  }

  setOpenManifestLinkRestoreDefaults() {
    console.log("Restore")
    this.data.openManifestLinks = Object.assign({},this.theme.openManifestLinks)
    this.setState(
      {openManifestLinks:this.theme.openManifestLinks},
      this.upd
    )
    // this.data.openManifestLinks = Object.assign({},this.theme.openManifestLinks)
    // console.log("Restore")
    // console.log({DATA: this.data.openManifestLinks, THEME: this.theme.openManifestLinks, STATE: this.state.openManifestLinks})
    // chrome.storage.sync.set(this.data)
  }

  upd() {
    this.data = Object.assign({},this.data,this.state)
    chrome.storage.sync.set(this.data)
  }

  render() {

    console.log({render_opts_with_state:this.state})

    let manifestViewers = []
    for(let key of Object.keys(this.state.openManifestLinks).sort() ) {
      let link = this.state.openManifestLinks[key]
      let hashkey = v5(link.url,'1b671a63-40d3-4913-99b3-da01ff1f3343')
      manifestViewers.push(
        <Card key={`manifestViewer-${hashkey}`} sx={{margin:'16px 0'}}>
          <CardContent>
            <TextField label="URL" defaultValue={link.url} size="small" fullWidth style={{margin:"8px"}}
              onChange={ (e) => this.setOpenManifestLinkURL(key,e.target.value) }
              key={`manifestViewer-URL-${hashkey}`}
            />
            <br />
            <TextField label="Label" defaultValue={link.label['en']} size="small" fullWidth style={{margin:"8px"}}
              onChange={ (e) => this.setOpenManifestLinkLang(key,e.target.value,'en') }
              key={`manifestViewer-Label-${hashkey}`}
            />
          </CardContent>
          <CardActions>

          <Button variant="outlined" size="small" color="error"
            onClick={ (e) => { this.setOpenManifestLinkRemove(key) } }
          >
            Remove
          </Button>

          </CardActions>
        </Card>
      )
    }


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

      <Divider />

      <h2>Options</h2>

      <p>Version: {chrome.runtime.getManifest().version}</p>
      <div className="optionsEntry">
        <FormControlLabel
              control={
                <div className="optionsFloatRight"><Switch name="showUrls" defaultChecked={true} /></div>
              }
              label="View IIIF Manifest URLs"
              onChange={(e)=>{ this.setState({showUrls:e.target.checked}, this.upd) }}
              labelPlacement="start"
              style={{marginLeft:0,width:"90%"}}
            />
      </div>

      <Divider />

      <h2>Collections/Basket Viewers</h2>

      <div className="optionsEntry">
        <FormControlLabel
              control={
                <div className="optionsFloatRight"><Switch name="UVZB" defaultChecked={true} /></div>
              }
              label="Universal Viewer (ZB Zürich)"
              onChange={(e)=>{ }}
              labelPlacement="start"
              style={{marginLeft:0,width:"90%"}}
            />
      </div>

      <Divider />

      <h2>Manifest Viewers</h2>

      {manifestViewers}

      <Button variant="contained" size="small" color="primary"
        onClick={() => { }}
      >
        Add
      </Button>

      <Button variant="outlined" size="small" color="error"
        onClick={() => { this.setOpenManifestLinkRestoreDefaults() }}
      >
        Reset Defaults
      </Button>


      <Divider style={{margin:'48px 0'}}/>

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


export default Options
