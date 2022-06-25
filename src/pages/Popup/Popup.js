/*global chrome*/
import React, { Component } from 'react'

import Theme from '../../themes/active/Theme.js'
import Defaults from '../../themes/active/Defaults.js'

import {getCurrentTab} from "./common/Utils"
import DisplayCollection from "./components/DisplayCollection"
import DisplayManifest from "./components/DisplayManifest"
import DisplayImage from "./components/DisplayImage"
import DisplayBasket from "./components/DisplayBasket"
import PostButton from "./components/PostButton"

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Snackbar from '@mui/material/Snackbar';

import packageJson from '../../../package.json'

import { v4 } from 'uuid'
import { v5 } from 'uuid'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

class Popup extends Component {
    constructor(props) {
        super(props)
        this.theme = new Theme()
        this.defaults = new Defaults()
        this.state = {
            manifests: {},
            collections: {},
            images: {},
            basket: {},
            settings: {
              showUrl: true,
              postBasketCollectionTo: Object.assign({},this.theme.postBasketCollectionTo),
              openManifestLinks: Object.assign({},this.theme.openManifestLinks),
              viewManifestInfo: Object.assign({},this.theme.viewManifestInfo)
            },
            tab: 0, // 0=Manifests 1=Images 2=Collections 3=Basket 4=About
            remDialog: false,
            remKey: null,
            snackOpen: false,
            snackMsg: ''
        }
        this.copyBasketCollection = this.copyBasketCollection.bind(this)
        this.closeRemDialog = this.closeRemDialog.bind(this)
        this.openRemDialog = this.openRemDialog.bind(this)
        this.removeOperation = this.removeOperation.bind(this)
        this.getDataFromLocalStorage = this.getDataFromLocalStorage.bind(this)
        // this.routine = this.routine.bind(this)

        this.loadBasket()

        chrome.storage.onChanged.addListener( (changes, namespace) => {
          for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

            if(namespace==="local" &&  key==="showUrl") {
              this.setState({settings:Object.assign({},this.state.settings,{showUrl:newValue})})
            }

            if(namespace==="local" &&  key==="postBasketCollectionTo") {
              this.setState({settings:Object.assign({},this.state.settings,{postBasketCollectionTo:newValue})})
            }

            if(namespace==="local" &&  key==="openManifestLinks") {
              this.setState({settings:Object.assign({},this.state.settings,{openManifestLinks:newValue})})
            }

            // console.log(
            //   `Storage key "${key}" in namespace "${namespace}" changed.`,
            //   `Old value was "${oldValue}", new value is "${newValue}".`
            // )
          }
        });
    }

    getDataFromLocalStorage() {
        getCurrentTab((tab) => {
            chrome.storage.local.get(['tabStorage'], (result) => {
              console.log({FEresult:result})
              if('tabStorage' in result) {
                let tabStorage = JSON.parse(result['tabStorage'])
                if(tabStorage[tab.id] !== undefined) {
                  console.log("OK "+tab.id)
                  this.setState(Object.assign({},tabStorage[tab.id]['iiif']), () => {
                    console.log({TS:this.state})
                  })
                }
              } else {
                console.log("NOT OK1 "+tab.id)
                this.setState({manifests:{},collections:{},images:{}})
              }
            })
        })
    }

    // routine() {
    //   this.getDataFromLocalStorage()
    //   setTimeout(this.routine,1000)
    // }

    componentDidMount() {
        // getCurrentTab((tab) => {
        //
        //     chrome.storage.local.get(['tabStorage'], (result) => {
        //       console.log({FEresult:result})
        //       if('tabStorage' in result) {
        //         let tabStorage = JSON.parse(result['tabStorage'])
        //         if(tabStorage[tab.id] !== undefined) {
        //           console.log("OK "+tab.id)
        //           this.setState(Object.assign({},tabStorage[tab.id]['iiif']), () => {
        //             console.log({TS:this.state})
        //           })
        //         }
        //       } else {
        //         console.log("NOT OK1 "+tab.id)
        //         this.setState({manifests:{},collections:{},images:{}})
        //       }
        //     })
        //
        //     // chrome.runtime.sendMessage({type: 'popupInit', tabId: tab.id, url: tab.url}, (response) => {
        //     //     if (response) {
        //     //         this.setState(Object.assign({},{...response.iiif})) //,{basket:response.basket}))
        //     //     }
        //     // })
        // })
        this.getDataFromLocalStorage()
        this.loadBasket()
        this.loadSettings()

        if(Object.keys(this.state.manifests).length>0) {
          this.setState({tab:0})
        } else if(Object.keys(this.state.images).length>0) {
          this.setState({tab:1})
        } else if(Object.keys(this.state.collections).length>0) {
          this.setState({tab:2})
        } else if(Object.keys(this.state.basket).length>0) {
          this.setState({tab:3})
        } else {
          this.setState({tab:0})
        }
    }

    copyUrl(url) {
      navigator.clipboard.writeText(url).then( () => {
        this.setState({
          snackOpen:true,
          snackMsg:'URL was copied to clipboard.'

        })
      }, () => {
        this.setState({
          snackOpen:true,
          snackMsg:'Failed to copy URL to clipboard.'
        })
      })
    }

    loadSettings() {
        chrome.storage.local.get('postBasketCollectionTo', (data) => {
          console.log({LocSetB:data})
          if('postBasketCollectionTo' in data) { this.setState({settings:Object.assign({},this.state.settings,data)}) }
        })
        chrome.storage.local.get('openManifestLinks', (data) => {
          console.log({LocSetM:data})
          if('openManifestLinks' in data) { this.setState({settings:Object.assign({},this.state.settings,data)}) }
        })
        chrome.storage.local.get('showUrl', (data) => {
          console.log({LocSetS:data})
          if('showUrl' in data) { this.setState({settings:Object.assign({},this.state.settings,data)}) }
        })
    }

    // FIXME use sync if it was asked for

    loadBasket() {
      console.log("loading basket "+this.defaults.storeBasket)
      const s = this.defaults.storeBasket==='sync' ? chrome.storage.local : chrome.storage.local
      s.get('basket', (data) => {
        if('basket' in data) {
          this.setState(data)
        }
      })
    }

    saveBasket(data) {
      console.log("saving basket "+this.defaults.storeBasket)
      const s = this.defaults.storeBasket==='sync' ? chrome.storage.local : chrome.storage.local
      s.set({basket:data}, () => {
        console.log({BSaved:data})
        this.setState({basket:data})
      })
    }

    addToBasket(key) {
      console.log({addKey:key})
      console.log({addFrom:this.state.manifests})
      let newbasket = Object.assign(this.state.basket)
      for(let mkey in this.state.manifests) {
        console.log(mkey+" ?== "+key)
        if(mkey==key) {
          console.log("YES")
         newbasket[key] = Object.assign({},this.state.manifests[mkey])
        }
      }
      this.saveBasket(newbasket)
      // chrome.runtime.sendMessage({type: 'basketUpd', basket: this.state.basket})
    }

    openRemDialog(key) {
      this.setState({remDialog:true,remKey:key})
    }

    closeRemDialog(key) {
      this.setState({remDialog:false,remKey:null})
    }

    removeOperation() {
      let newbasket = {}
      if(this.state.remKey!==null) {
        newbasket = Object.assign(this.state.basket)
        delete newbasket[this.state.remKey]
      } else {
        console.log("NOT??? removing from basket: "+this.state.remKey)
      }
      this.saveBasket(newbasket)
      this.closeRemDialog()
      // chrome.runtime.sendMessage({type: 'basketUpd', basket: newbasket})
    }

    buildBasketCollection(basket) {
      var c = {
            "@context": "http://iiif.io/api/presentation/2/context.json",
            "@id": "https://detektiiif.manducus.net/invalide",
            "@type": "sc:Collection",
            "label": "detektIIIF2 Collection",
            "manifests": []
      }
      for (var key in basket) {
        console.log(basket[key])
        c.manifests.push({
            "@id": basket[key].url, // shoud be .id -- Yes, this is for you, guys, providing other URLs than IDs!
            "@type": "sc:Manifest",
            "label": basket[key].label,
            "thumbnail": basket[key].thumb
        })
      }
      return c
    }

    copyBasketCollection() {
      var c = this.buildBasketCollection(this.state.basket)
      navigator.clipboard.writeText(JSON.stringify(c)).then( () => {
        this.setState({
          snackOpen:true,
          snackMsg:'JSON was copied to clipboard.'

        })
      }, () => {
        this.setState({
          snackOpen:true,
          snackMsg:'Failed to copy JSON to clipboard.'

        })
      })
    }

    render() {

        console.log({renderWithState:this.state})

        var cnn = Object.keys(this.state.collections).length
        var mnn = Object.keys(this.state.manifests).length
        var inn = Object.keys(this.state.images).length
        var bnn = Object.keys(this.state.basket).length

        let ms = []
        if(Object.keys(this.state.manifests).length>0) {
          for (let key in this.state.manifests) {
              ms.push(<
                  DisplayManifest
                  key = { `item-${this.state.manifests[key].id}` }
                  id = { this.state.manifests[key].id }
                  label = { this.state.manifests[key].label }
                  thumb = { this.state.manifests[key].thumb }
                  url = { this.state.manifests[key].url }
                  cors = { this.state.manifests[key].cors }
                  error = { this.state.manifests[key].error }
                  copyUrl = {this.copyUrl.bind(this)}
                  addToBasket = {this.addToBasket.bind(this)}
                  settings = {this.state.settings}
                  theme = {this.theme}
              />)
          }
        } else {
          ms = "No IIIF Manifests detected."
        }

        let cs = []
        if(Object.keys(this.state.collections).length>0) {
          // cs.push(<h3 key={'TABC'}>Presentation API: Collections<a name="ancc" /></h3>)
          for (let key in this.state.collections) {
              cs.push(<
                  DisplayCollection
                  key = { `item-${this.state.collections[key].id}` }
                  id = { this.state.collections[key].id }
                  label = { this.state.collections[key].label }
                  thumb = { this.state.collections[key].thumb }
                  url = { this.state.collections[key].url }
                  cors = { this.state.collections[key].cors }
                  error = { this.state.collections[key].error }
                  copyUrl = {this.copyUrl.bind(this)}
                  settings = {this.state.settings}
                  theme = {this.theme}
              />)
          }
        } else {
          cs = "No IIIF Collections detected."
        }

        let is = []
        if(Object.keys(this.state.images).length>0) {
          // is.push(<h3 key={'TABI'}>Image API<a name="anci" /></h3>)
          for (let key in this.state.images) {
              is.push(<
                  DisplayImage
                  key = { `item-${this.state.images[key].id}` }
                  id = { this.state.images[key].id }
                  label = { this.state.images[key].label }
                  thumb = { this.state.images[key].thumb }
                  url = { this.state.images[key].url }
                  cors = { this.state.images[key].cors }
                  error = { this.state.images[key].error }
                  version = { this.state.images[key].version }
                  copyUrl = {this.copyUrl.bind(this)}
                  settings = {this.state.settings}
                  theme = {this.theme}
              />)
          }
        } else {
          is = "No IIIF images detected."
        }

        console.log({basket:this.state.basket})

        let bs = []
        if(Object.keys(this.state.basket).length>0) {
          for (let key in this.state.basket) {
            console.log({pushing:this.state.basket[key]})
              bs.push(<
                  DisplayBasket
                  key = { `item-${this.state.basket[key].url}` }
                  id = { this.state.basket[key].id }
                  label = { this.state.basket[key].label }
                  thumb = { this.state.basket[key].thumb }
                  url = { this.state.basket[key].url }
                  cors = { this.state.basket[key].cors }
                  error = { this.state.basket[key].error }
                  copyUrl = {this.copyUrl.bind(this)}
                  removeFromBasket = {this.openRemDialog.bind(this)}
                  settings = {this.state.settings}
                  theme = {this.theme}
              />)
          }
        } else {
          bs = this.theme.basketName + " is empty."
        }

        // alert("APP "+JSON.stringify(this.state.manifests))

        let cc = ms.concat(cs,is,bs)
        if(cc.length==0) {
          cc.push("No IIIF content on this page.")
        }

        console.log("RENDER")

        let subHeaderContent = []
        let outputContent = []

        if(this.defaults.tabs===true) {
          outputContent.push(
            <div key={"TABBOX2"}>
              <Tabs value={this.state.tab} onChange={(e,v)=>{this.setState({tab:v})}} aria-label="basic tabs example">
                <Tab label={"Manifests"+(mnn>0?` (${mnn})`:``)} value={0} {...a11yProps(0)} key={"TAB0"} />
                <Tab label={"Images"+(inn>0?` (${inn})`:``)} value={1} {...a11yProps(1)} key={"TAB1"} />
                <Tab label={"Collections"+(cnn>0?` (${cnn})`:``)} value={2}  {...a11yProps(2)} key={"TAB2"} />
                <Tab label={`${this.theme.basketName}`+(bnn>0?` (${bnn})`:``)} value={3} {...a11yProps(3)} key={"TAB3"} />
                <Tab label="About" value={4} {...a11yProps(4)} key={"TAB4"} />
              </Tabs>
            </div>
          )
          outputContent.push(
            <div key={"TABBOX3"}>
              <TabPanel value={this.state.tab} index={0} key={"TABPANEL0"}>
                {ms}
              </TabPanel>
              <TabPanel value={this.state.tab} index={1} key={"TABPANEL1"}>
                {is}
              </TabPanel>
              <TabPanel value={this.state.tab} index={2} key={"TABPANEL2"}>
                {cs}
              </TabPanel>
              <TabPanel value={this.state.tab} index={3} key={"TABPANEL3"}>
                {Object.keys(this.state.settings.postBasketCollectionTo).map(key =>
                  this.state.settings.postBasketCollectionTo[key].tabBasket===true ?
                  <PostButton
                    lang="en"
                    link={this.state.settings.postBasketCollectionTo[key]}
                    theme={this.theme}
                    key={`postbutton-${v5(this.state.settings.postBasketCollectionTo[key].url+key,'1b671a64-40d5-491e-99b0-d37347111f20')}`}
                    basket={this.state.basket}
                    buildBasketCollection={this.buildBasketCollection}
                  /> : null
                )}
                <button onClick={() => this.copyBasketCollection()} className="ButtonCopyBasket" key={"COPYBASKETCOLLECTION"}>Copy {this.theme.basketName} (JSON)</button>
                <button onClick={() => this.openRemDialog(null)} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>Clear {this.theme.basketName}</button>
                <br key={v4()}/>
                <br key={v4()}/>
                {bs}
              </TabPanel>
              <TabPanel value={this.state.tab} index={4} key={"TABPANEL4"}>
                {this.theme.about}
                {'detektIIIF2 Version '}{this.softwareVersion}{' / Theme Version '}{this.themeVersion}
              </TabPanel>
            </div>
          )
        } else {
          switch(this.state.tab) {
            case 0:
              subHeaderContent.push(<h3 key={'TABM'} className="SubHeaderHeading">Available Manifests</h3>)
              // subHeaderContent.push(<div className="SubHeaderButtons" key={"SUBHEADERBUTTONS"}></div>)
              break
            case 4:
              subHeaderContent.push(<h3 key={'TABA'} className="SubHeaderHeading">About</h3>)
              // subHeaderContent.push(<div className="SubHeaderButtons" key={"SUBHEADERBUTTONS"}></div>)
              break
            case 3:
              subHeaderContent.push(<h3 key={'TABB'} className="SubHeaderHeading">{this.theme.basketName} ({bnn})</h3>)
              subHeaderContent.push(
                <div className="SubHeaderButtons" key={"SUBHEADERBUTTONS"}>
                  <button onClick={() => this.copyBasketCollection()} className="ButtonCopyBasket" key={"COPYBASKETCOLLECTION"}>Copy Collection (JSON)</button>
                  {Object.keys(this.state.settings.postBasketCollectionTo).map(key =>
                    <PostButton
                      lang="en"
                      link={this.state.settings.postBasketCollectionTo[key]}
                      theme={this.theme}
                      key={`postbutton-${v5(this.state.settings.postBasketCollectionTo[key].url+key,'1b671a64-40d5-491e-99b0-d37347111f20')}`}
                      basket={this.state.basket}
                      buildBasketCollection={this.buildBasketCollection}
                    />
                  )}
                  <Tooltip title="Remove all manifests">
                    {
                      this.theme.removeAllBasketImage===null ?
                      <button onClick={() => this.openRemDialog(null)} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>Remove All</button>
                      :
                      <IconButton color="primary" onClick={() => this.openRemDialog(null)} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>
                        <img src={this.theme.removeAllBasketImage}  className="iconSize" />
                      </IconButton>
                    }

                  </Tooltip>
                </div>
              )
              break
            default:
              break
          }
          outputContent.push(
            <div key={'TABBOX0'}>
                <TabPanel value={this.state.tab} index={0} key={"TABPANEL0"}>
                  {ms}
                </TabPanel>
                <TabPanel value={this.state.tab} index={1} key={"TABPANEL1"}>
                  {is}
                </TabPanel>
                <TabPanel value={this.state.tab} index={2} key={"TABPANEL2"}>
                  {cs}
                </TabPanel>
                <TabPanel value={this.state.tab} index={3} key={"TABPANEL3"}>
                  {bs}
                </TabPanel>
                <TabPanel value={this.state.tab} index={4} key={"TABPANEL4"}>
                  {this.theme.about}<br />
                  {'detektIIIF2 '}{this.softwareVersion}{' / Theme'}{this.themeVersion}
                </TabPanel>
            </div>
          )
        }

        this.themeVersion = chrome.runtime.getManifest().version
        this.softwareVersion = packageJson.version

        let header = null
        if(this.theme.logoImageBig) {
          header= <div className="App-header" key={'App-header-0'}>
                    <img src={this.theme.logoImageBig} className="Logo-image-Big" />
                    <small className="version" key={v4()}></small>
                    { this.theme.logoSecondaryImageBig ? <img src={this.theme.logoSecondaryImageBig} alt={this.theme.title} className="Logo-image-Secondary-Big" /> : null }
                  </div>
        } else {
          header= <div className="App-header" key={'App-header-0'}>
                    <h2 className="App-title" key={v4()}>{this.theme.title}<img src={this.theme.logoImage} className="Logo-image" /></h2>
                    <small className="version" key={v4()}></small>
                    { this.theme.logoSecondaryImageBig ? <img src={this.theme.logoSecondaryImageBig} alt={this.theme.title} className="Logo-image-Secondary-Big" /> : null }
                  </div>
        }

        console.log({Theme:this.theme})

        return(
          <div className="App" key={"App"}>
            {header}
            <div className="App-subheader" key={'App-subheader-0'}>
              {subHeaderContent}
              <div className="BasketIcon" style={{display:(this.defaults.tabs===true?'none':'block')}} key={v4()}  >
                <Tooltip title={this.state.tab===0 ? ("Open "+this.theme.basketName) : ("Close "+this.theme.basketName)}>
                <IconButton color="primary"
                  aria-label={this.theme.basketName}
                  component="span"
                  onClick={ () => {
                    this.setState({tab: this.state.tab!==0?0:3 })
                  } }
                >
                  <Badge
                    badgeContent={this.state.tab===0?Object.keys(this.state.basket).length:0}
                    className="BasketBadge"
                  >
                    {
                      this.state.tab===0 ?
                      (this.theme.basketImage!==null ? <img src={this.theme.basketImage} className="BasketIconImage"/> : <ShoppingCartOutlinedIcon />)
                      :
                      (this.theme.closeBasketImage!==null ? <img src={this.theme.closeBasketImage} className="BasketIconImage"/> : <CancelOutlinedIcon />)
                    }
                  </Badge>
                </IconButton>
                </Tooltip>
              </div>
            </div>

            <div className="App-body" key={'App-body-0'}>
              {outputContent}
            </div>

            <div className="App-footer" key={'App-footer-0'}>
              <span>
                <a href="#" onClick={ () => { this.setState({tab:4}) } } key={"FOOTERABOUT"}>About</a>
                &nbsp;|&nbsp;
                <a href="#" onClick={ () => { chrome.runtime.openOptionsPage() } } key={"FOOTEROPTIONS"}>Options</a>
              </span>
            </div>

            <Dialog open={this.state.remDialog}>
              <DialogTitle id="alert-dialog-title">
                {this.state.remKey===null?"Remove all items?":"Remove this item?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.closeRemDialog}>No</Button>
                <Button onClick={this.removeOperation} autoFocus>Yes</Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={this.state.snackOpen}
              onClose={() => this.setState({snackOpen:false})}
              autoHideDuration={1000}
              anchorOrigin={{vertical:'top',horizontal:'center'}}
              message={this.state.snackMsg}
              key={`snack-${this.state.snackMsg}`}
            />

          </div>
        )

    }
}

export default Popup
