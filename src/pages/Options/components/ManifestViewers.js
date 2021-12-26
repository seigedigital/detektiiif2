import React, { Component } from 'react'

import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import Divider from '@mui/material/Divider';

import Button from '@mui/material/Button';

import Theme from '../../../themes/active/Theme.js'
import Defaults from '../../../themes/active/Defaults.js'

import { v5 } from 'uuid'

class ManifestViewers extends Component {

  constructor(props) {
    super()
    this.setOpenManifestLinkURL = this.setOpenManifestLinkURL.bind(this)
    this.setOpenManifestLinkLang = this.setOpenManifestLinkLang.bind(this)
    this.setOpenManifestLinkRemove = this.setOpenManifestLinkRemove.bind(this)
    this.setOpenManifestLinkRestoreDefaults = this.setOpenManifestLinkRestoreDefaults.bind(this)
    this.getOpenManifestLinks = this.getOpenManifestLinks.bind(this)

    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)

    this.state = {
      openManifestLinks: Object.assign({},this.theme.openManifestLinks)
    }

  }

  getOpenManifestLinks() {
    chrome.storage.sync.get('openManifestLinks', (data) => {
      if('openManifestLinks' in data) {
        this.setState({openManifestLinks:data.openManifestLinks})
      }
    })
  }

  componentDidMount() {
    this.getOpenManifestLinks()
  }

  setOpenManifestLinkURL(key,value) {
    let data = Object.assign({},this.state.openManifestLinks)
    data[key].url = value
    this.setState({openManifestLinks:data}, this.upd)
  }

  setOpenManifestLinkLang(key,value,lang) {
    let data = Object.assign({},this.state.openManifestLinks)
    data[key].label[lang] = value
    this.setState({openManifestLinks:data}, this.upd)
  }

  setOpenManifestLinkRemove(key) {
    let data = Object.assign({},this.state.openManifestLinks)
    delete data[key]
    this.setState({openManifestLinks:data}, this.upd)
  }

  setOpenManifestLinkRestoreDefaults() {
    this.setState({openManifestLinks:this.theme.openManifestLinks}, this.upd)
  }

  upd() {
    chrome.storage.sync.set({openManifestLinks:this.state.openManifestLinks})
  }

  render() {

    console.log({render_ManViews_with_state:this.state})

    let manifestViewers = []
    for(let key of Object.keys(this.state.openManifestLinks).sort() ) {
      let link = this.state.openManifestLinks[key]
      let hashkey = v5(link.url,'1b671a63-40d3-4913-99b3-da01ff1f3343')
      manifestViewers.push(
        <Card key={`manifestViewer-${hashkey}`} sx={{margin:'16px 0'}}>
          <CardContent>
            <TextField label="Label" value={link.label['en']} size="small" fullWidth style={{margin:"8px"}}
              onChange={ (e) => this.setOpenManifestLinkLang(key,e.target.value,'en') }
              key={`manifestViewer-Label-${hashkey}`}
            />
            <br />
            <TextField label="URL" value={link.url} size="small" fullWidth style={{margin:"8px"}}
              onChange={ (e) => this.setOpenManifestLinkURL(key,e.target.value) }
              key={`manifestViewer-URL-${hashkey}`}
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

      <Accordion style={{border:'0',boxShadow:'none'}} disableGutters={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{backgroundColor:'#fff',padding:'0 0',border:'0'}} >
          <h2>Manifest Viewers</h2>
        </AccordionSummary>
        <AccordionDetails>
          {manifestViewers}
          <br />
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
        </AccordionDetails>
      </Accordion>

    )
  }
}

export default ManifestViewers
