import React, { Component } from 'react'

import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import Divider from '@mui/material/Divider';

import Button from '@mui/material/Button';

import Theme from '../../../themes/active/Theme.js'
import Defaults from '../../../themes/active/Defaults.js'

import { v5 } from 'uuid'
import { v4 } from 'uuid'

class CollectionViewers extends Component {

  constructor(props) {
    super()
    this.setOpenCollectionLinkLang = this.setOpenCollectionLinkLang.bind(this)
    this.setOpenCollectionLinkRemove = this.setOpenCollectionLinkRemove.bind(this)
    this.setOpenCollectionLinkRestoreDefaults = this.setOpenCollectionLinkRestoreDefaults.bind(this)
    this.getOpenCollectionLinks = this.getOpenCollectionLinks.bind(this)
    this.setOpenCollectionValue = this.setOpenCollectionValue.bind(this)
    this.addNewLink = this.addNewLink.bind(this)

    this.theme = new Theme()
    this.defaults = new Defaults()

    this.upd = this.upd.bind(this)

    this.state = {
      dialogOpen: false,
      inputLabel: '',
      inputURL: '',
      inputMode: '',
      inputVariable: '',
      inputCollections: true,
      inputBasket: true,
      postBasketCollectionTo: Object.assign({},this.theme.postBasketCollectionTo)
    }

  }

  addNewLink() {
    let entry = {}
    entry[v4()] = {
        url: this.state.inputURL,
        mode: this.state.inputMode,
        variable: this.state.inputVariable,
        label: { en: this.state.inputLabel},
        tabBasket: this.state.inputBasket,
        tabCollections: this.state.inputCollections
    }
    let data = Object.assign({},this.state.postBasketCollectionTo,entry)
    this.setState({postBasketCollectionTo:data}, this.upd)
    this.setState({dialogOpen:false})
  }

  getOpenCollectionLinks() {
    chrome.storage.local.get('postBasketCollectionTo', (data) => {
      if('postBasketCollectionTo' in data) {
        this.setState({postBasketCollectionTo:data.postBasketCollectionTo})
      }
    })
  }

  componentDidMount() {
    this.getOpenCollectionLinks()
  }

  setOpenCollectionValue(key,value,field) {
    let data = Object.assign({},this.state.postBasketCollectionTo)
    data[key][field] = value
    this.setState({postBasketCollectionTo:data}, this.upd)
  }

  setOpenCollectionLinkLang(key,value,lang) {
    let data = Object.assign({},this.state.postBasketCollectionTo)
    data[key].label[lang] = value
    this.setState({postBasketCollectionTo:data}, this.upd)
  }

  setOpenCollectionLinkRemove(key) {
    let data = Object.assign({},this.state.postBasketCollectionTo)
    delete data[key]
    this.setState({postBasketCollectionTo:data}, this.upd)
  }

  setOpenCollectionLinkRestoreDefaults() {
    this.setState({postBasketCollectionTo:this.theme.postBasketCollectionTo}, this.upd)
  }

  upd() {
    chrome.storage.local.set({postBasketCollectionTo:this.state.postBasketCollectionTo})
  }

  render() {

    if(this.theme.optionsLists.openCollectionLinks===false) {
      return null
    }

    console.log({render_ManViews_with_state:this.state})

    let collectionViewers = []
    for(let key of Object.keys(this.state.postBasketCollectionTo).sort() ) {
      let link = this.state.postBasketCollectionTo[key]
      let cardsx = {margin:'16px 0'}
      if('options' in link && 'hidden' in link.options && link.options.hidden===true) {
        cardsx = {margin:'16px 0',display:'none'}
      }
      let hashkey = v5(link.url,'1b671a63-40d3-4913-99b3-da01ff1f3343')
      collectionViewers.push(
        <Card key={`manifestViewer-${hashkey}`} sx={cardsx}>
          <CardContent>
            <TextField label="Label" value={link.label['en']} size="small" fullWidth style={{margin:"12px 0"}}
              onChange={ (e) => this.setOpenCollectionLinkLang(key,e.target.value,'en') }
              key={`manifestViewer-Label-${hashkey}`}
            />
            <TextField label="URL" value={link.url} size="small" fullWidth style={{margin:"12px 0"}}
              onChange={ (e) => this.setOpenCollectionValue(key,e.target.value,'url') }
              key={`manifestViewer-URL-${hashkey}`}
            />
            <FormControl style={{margin:"12px 0"}}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={link.mode}
                size="small"
                label="Mode"
                onChange={ (e) => this.setOpenCollectionValue(key,e.target.value,'mode') }
              >
                <MenuItem value={'x-www-form-urlencoded'}>POST application/x-www-form-urlencoded</MenuItem>
                <MenuItem value={'json'}>POST application/json</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Variable (Form)" value={link.variable} size="small" fullWidth style={{margin:"12px 0"}}
              onChange={ (e) => this.setOpenCollectionValue(key,e.target.value,'variable') }
              key={`manifestViewer-Form-${hashkey}`}
              disabled={link.mode==='json'}
            />
            <FormGroup row>
              <FormControlLabel control={<Checkbox checked={link.tabCollections}
                  onChange={ (e) => this.setOpenCollectionValue(key,e.target.checked,'tabCollections') }
                  key={`checkbox-collections-${hashkey}`}
                />} label="Collections"
              />
              <FormControlLabel control={<Checkbox checked={link.tabBasket}
                  onChange={ (e) => this.setOpenCollectionValue(key,e.target.checked,'tabBasket') }
                  key={`checkbox-basket-${hashkey}`}
                />} label="Basket"
              />
            </FormGroup>
          </CardContent>
          <CardActions>

          <Button variant="outlined" size="small" color="error"
            onClick={ (e) => { this.setOpenCollectionLinkRemove(key) } }
          >
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
          <h2>Collection Viewers</h2>
        </AccordionSummary>
        <AccordionDetails style={{padding:'0'}}>
          {collectionViewers}
          <br />
          <Button variant="contained" size="small" color="primary" onClick={() => this.setState({dialogOpen:true})}>
          Add
          </Button>

          <Button variant="outlined" size="small" color="error"
            onClick={() => { this.setOpenCollectionLinkRestoreDefaults() }}
          >
            Reset Defaults
          </Button>
        </AccordionDetails>
      </Accordion>


      <Dialog open={this.state.dialogOpen} onClose={() => this.setState({dialogOpen:false})}>
        <DialogTitle>Add Collection Viewer</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            variant="standard"
            onChange={ (e) => this.setState({inputLabel:e.target.value}) }
            key={`Add-getOpenCollectionLinks-Label`}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="standard"
            onChange={ (e) => this.setState({inputURL:e.target.value}) }
            key={`Add-getOpenCollectionLinks-URL`}
          />
          <FormControl style={{margin:"12px 0"}}>
            <InputLabel>Mode</InputLabel>
            <Select
              value={'x-www-form-urlencoded'}
              size="small"
              label="Mode"
              onChange={ (e) => this.setState({inputMode:e.target.value}) }
            >
              <MenuItem value={'x-www-form-urlencoded'}>POST application/x-www-form-urlencoded</MenuItem>
              <MenuItem value={'json'}>POST application/json</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Variable (Form)"
            fullWidth
            variant="standard"
            onChange={ (e) => this.setState({inputVariable:e.target.value}) }
            key={`Add-getOpenCollectionLinks-Var`}
          />
          <FormGroup row>
            <FormControlLabel control={<Checkbox defaultChecked
                onChange={ (e) => this.setState({inputCollections:e.target.checked}) }
                key={`add-checkbox-collections`}
              />} label="Collections"
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

export default CollectionViewers
