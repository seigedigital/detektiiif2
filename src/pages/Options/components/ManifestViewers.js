import React, { Component } from 'react'

import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Divider from '@mui/material/Divider';

import Theme from '../../../themes/active/Theme.js'
import Defaults from '../../../themes/active/Defaults.js'

import { v5, v4 } from 'uuid'

class ManifestViewers extends Component {

  constructor(props) {
    super()
    this.setOpenManifestLinkURL = this.setOpenManifestLinkURL.bind(this)
    this.setOpenManifestLinkLang = this.setOpenManifestLinkLang.bind(this)
    this.setOpenManifestLinkRemove = this.setOpenManifestLinkRemove.bind(this)
    this.setOpenManifestLinkRestoreDefaults = this.setOpenManifestLinkRestoreDefaults.bind(this)
    this.setOpenManifestCheckbox = this.setOpenManifestCheckbox.bind(this)
    this.getOpenManifestLinks = this.getOpenManifestLinks.bind(this)
    this.addNewLink = this.addNewLink.bind(this)

    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)

    this.state = {
      dialogOpen: false,
      inputLabel: '',
      inputURL: '',
      inputManifests: true,
      inputBasket: true,
      openManifestLinks: Object.assign({},this.theme.openManifestLinks)
    }

  }

  addNewLink() {
    let entry = {}
    entry[v4()] = {
        url: this.state.inputURL,
        label: { en: this.state.inputLabel},
        tabBasket: this.state.inputBasket,
        tabManifests: this.state.inputManifests
    }
    let data = Object.assign({},this.state.openManifestLinks,entry)
    this.setState({openManifestLinks:data}, this.upd)
    this.setState({dialogOpen:false})
  }

  getOpenManifestLinks() {
    chrome.storage.local.get('openManifestLinks', (data) => {
      if('openManifestLinks' in data) {
        this.setState({openManifestLinks:data.openManifestLinks})
      }
    })
  }

  componentDidMount() {
    this.getOpenManifestLinks()
  }

  setOpenManifestCheckbox(key,value,cb) {
    let data = Object.assign({},this.state.openManifestLinks)
    data[key][cb] = value
    this.setState({openManifestLinks:data}, this.upd)
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
    chrome.storage.local.set({openManifestLinks:this.state.openManifestLinks})
  }

  render() {

    if(this.theme.optionsLists.openManifestLinks===false) {
      return null
    }

    console.log({render_ManViews_with_state:this.state})

    let manifestViewers = []
    for(let key of Object.keys(this.state.openManifestLinks).sort() ) {
      let link = this.state.openManifestLinks[key]
      let hashkey = v5(link.url,'1b671a63-40d3-4913-99b3-da01ff1f3343')
      manifestViewers.push(

        <Card key={`card-${hashkey}`}>
            <CardContent>
              <TextField label="Label" value={link.label['en']} size="small" fullWidth style={{margin:"8px 0"}}
                onChange={ (e) => this.setOpenManifestLinkLang(key,e.target.value,'en') }
                key={`manifestViewer-Label-${hashkey}`}
              />
              <br />
              <TextField label="URL" value={link.url} size="small" fullWidth style={{margin:"8px 0"}}
                onChange={ (e) => this.setOpenManifestLinkURL(key,e.target.value) }
                key={`manifestViewer-URL-${hashkey}`}
              />
              <FormGroup row>
                <FormControlLabel control={<Checkbox checked={link.tabManifests}
                    onChange={ (e) => this.setOpenManifestCheckbox(key,e.target.checked,'tabManifests') }
                    key={`checkbox-manifests-${hashkey}`}
                  />} label="Manifests"
                />
                <FormControlLabel control={<Checkbox checked={link.tabBasket}
                    onChange={ (e) => this.setOpenManifestCheckbox(key,e.target.checked,'tabBasket') }
                    key={`checkbox-basket-${hashkey}`}
                  />} label="Basket"
                />
              </FormGroup>
          </CardContent>
          <CardActions>
            <Button variant="outlined" size="small" color="error" onClick={ (e) => { this.setOpenManifestLinkRemove(key) } }>
              Remove
            </Button>
          </CardActions>

        </Card>

      )
    }


    return (

      <span>

      <Accordion style={{border:'0',boxShadow:'none',margin:'12px 0'}} disableGutters={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{backgroundColor:'#fff',padding:'0 0',border:'0'}} >
          <h2>Manifest Viewers</h2>
        </AccordionSummary>
        <AccordionDetails style={{padding:'0'}}>
          {manifestViewers}
          <br />
          <Button variant="contained" size="small" color="primary" onClick={() => this.setState({dialogOpen:true})}>
            Add
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={() => { this.setOpenManifestLinkRestoreDefaults() }}>
            Reset Defaults
          </Button>
        </AccordionDetails>
      </Accordion>

      <Dialog open={this.state.dialogOpen} onClose={() => this.setState({dialogOpen:false})}>
        <DialogTitle>Add</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add label and URL with placeholder %%%URI%%%
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            variant="standard"
            onChange={ (e) => this.setState({inputLabel:e.target.value}) }
            key={`Add-openManifestLinks-Label`}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="standard"
            onChange={ (e) => this.setState({inputURL:e.target.value}) }
            key={`Add-openManifestLinks-URL`}
          />
          <FormGroup row>
            <FormControlLabel control={<Checkbox defaultChecked
                onChange={ (e) => this.setState({inputManifests:e.target.checked}) }
                key={`add-checkbox-manifests`}
              />} label="Manifests"
            />
            <FormControlLabel control={<Checkbox defaultChecked
                onChange={ (e) => this.setState({inputBasket:e.target.checked}) }
                key={`add-checkbox-basket`}
              />} label="Basket"
            />
        </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({dialogOpen:false})}>Cancel</Button>
          <Button onClick={this.addNewLink}>Add</Button>
        </DialogActions>
      </Dialog>

      </span>
    )
  }
}

export default ManifestViewers
