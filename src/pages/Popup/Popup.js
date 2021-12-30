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
              openManifestLinks: Object.assign({},this.theme.openManifestLinks)
            },
            tab: 0, // 0=Manifests 1=Images 2=Collections 3=Basket
        }
        this.copyBasketCollection = this.copyBasketCollection.bind(this)

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

            console.log(
              `Storage key "${key}" in namespace "${namespace}" changed.`,
              `Old value was "${oldValue}", new value is "${newValue}".`
            );
          }
        });

    }

    componentDidMount() {

        getCurrentTab((tab) => {
            chrome.runtime.sendMessage({type: 'popupInit', tabId: tab.id, url: tab.url}, (response) => {
                if (response) {
                    this.setState(Object.assign({},{...response.iiif})) //,{basket:response.basket}))
                }
            })
        })

        this.loadBasket()
        this.loadSettings()

    }

    copyUrl(url) {
      navigator.clipboard.writeText(url).then(function() {
        alert("URL copied.")
      }, function() {
        alert("Copying URL failed.")
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
      let newbasket = Object.assign(this.state.basket)
      newbasket[key] = this.state.manifests[key]
      this.saveBasket(newbasket)
      // chrome.runtime.sendMessage({type: 'basketUpd', basket: this.state.basket})
    }

    removeFromBasket(key) {
      let newbasket = Object.assign(this.state.basket)
      delete newbasket[key]
      this.saveBasket(newbasket)
      // chrome.runtime.sendMessage({type: 'basketUpd', basket: newbasket})
    }

    clearBasket(key) {
      let newbasket = {}
      this.saveBasket(newbasket)
      // chrome.runtime.sendMessage({type: 'basketUpd', basket: newbasket})
    }

    buildBasketCollection(basket) {
      var c = {
            "@context": "http://iiif.io/api/presentation/2/context.json",
            "@id": "https://detektiiif.manducus.net/invalid",
            "@type": "sc:Collection",
            "label": "custom detektIIIF collection",
            "manifests": []
      }
      for (var key in basket) {
        c.manifests.push({
            "@id": basket[key].id,
            "@type": "sc:Manifest",
            "label": basket[key].label
        })
      }
      return c
    }

    copyBasketCollection() {
      var c = this.buildBasketCollection(this.state.basket)
      navigator.clipboard.writeText(JSON.stringify(c)).then(function() {
        alert("Collection copied.")
      }, function() {
        alert("Copying Collection failed.")
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
          cs.push(<h3 key={'TABC'}>Presentation API: Collections<a name="ancc" /></h3>)
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
              />)
          }
        } else {
          cs = "No IIIF Collections detected."
        }

        let is = []
        if(Object.keys(this.state.images).length>0) {
          is.push(<h3 key={'TABI'}>Image API<a name="anci" /></h3>)
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
                  copyUrl = {this.copyUrl.bind(this)}
              />)
          }
        } else {
          is = "No IIIF images detected."
        }

        console.log({basket:this.state.basket})

        let bs = []
        if(Object.keys(this.state.basket).length>0) {
          for (let key in this.state.basket) {
              bs.push(<
                  DisplayBasket
                  key = { `item-${this.state.basket[key].id}` }
                  id = { this.state.basket[key].id }
                  label = { this.state.basket[key].label }
                  thumb = { this.state.basket[key].thumb }
                  url = { this.state.basket[key].url }
                  cors = { this.state.basket[key].cors }
                  error = { this.state.basket[key].error }
                  copyUrl = {this.copyUrl.bind(this)}
                  removeFromBasket = {this.removeFromBasket.bind(this)}
                  settings = {this.state.settings}
                  theme = {this.theme}
              />)
          }
        } else {
          bs = "Basket is empty."
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
                <Tab label="Manifests" value={0} {...a11yProps(0)} key={"TAB0"} />
                <Tab label="Images" value={1} {...a11yProps(1)} key={"TAB1"} />
                <Tab label="Collections" value={2}  {...a11yProps(2)} key={"TAB2"} />
                <Tab label={`Basket (${bnn})`} value={3} {...a11yProps(3)} key={"TAB3"} />
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
                    theme={this.props.theme}
                    key={`postbutton-${v5(this.state.settings.postBasketCollectionTo[key].url+key,'1b671a64-40d5-491e-99b0-d37347111f20')}`}
                    basket={this.state.basket}
                    buildBasketCollection={this.buildBasketCollection}
                  /> : null
                )}
                <button onClick={() => this.copyBasketCollection()} className="ButtonCopyBasket" key={"COPYBASKETCOLLECTION"}>Copy Basket Collection (JSON)</button>
                <button onClick={() => this.clearBasket()} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>Clear Basket</button>
                <br key={v4()}/>
                {bs}
              </TabPanel>
              <TabPanel value={this.state.tab} index={4} key={"TABPANEL4"}>
                {this.theme.about}
              </TabPanel>
            </div>
          )
        } else {
          switch(this.state.tab) {
            case 0:
              subHeaderContent.push(<h3 key={'TABM'} className="SubHeaderHeading">Available Manifests</h3>)
              subHeaderContent.push(<div className="SubHeaderButtons" key={"SUBHEADERBUTTONS"}></div>)
              break
            case 4:
              subHeaderContent.push(<h3 key={'TABA'} className="SubHeaderHeading">About</h3>)
              subHeaderContent.push(<div className="SubHeaderButtons" key={"SUBHEADERBUTTONS"}></div>)
              break
            case 3:
              subHeaderContent.push(<h3 key={'TABB'} className="SubHeaderHeading">Basket ({bnn})</h3>)
              subHeaderContent.push(
                <div className="SubHeaderButtons" key={"SUBHEADERBUTTONS"}>
                  {Object.keys(this.state.settings.postBasketCollectionTo).map(key =>
                    <PostButton
                      lang="en"
                      link={this.state.settings.postBasketCollectionTo[key]}
                      theme={this.props.theme}
                      key={`postbutton-${v5(this.state.settings.postBasketCollectionTo[key].url+key,'1b671a64-40d5-491e-99b0-d37347111f20')}`}
                      basket={this.state.basket}
                      buildBasketCollection={this.buildBasketCollection}
                    />
                  )}
                  <button onClick={() => this.copyBasketCollection()} className="ButtonCopyBasket" key={"COPYBASKETCOLLECTION"}>Copy Collection (JSON)</button>
                  <button onClick={() => this.clearBasket()} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>Remove all</button>
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
                  {this.theme.about}
                </TabPanel>
            </div>
          )
        }

        let header = null
        if(this.theme.logoImageBig) {
          header= <div className="App-header" key={'App-header-0'}>
                    <img src={this.theme.logoImageBig} className="Logo-image-Big" />
                    <small className="version" key={v4()}>{chrome.runtime.getManifest().version}</small>
                  </div>
        } else {
          header= <div className="App-header" key={'App-header-0'}>
                    <h2 className="App-title" key={v4()}>{this.theme.title}<img src={this.theme.logoImage} className="Logo-image" /></h2>
                    <small className="version" key={v4()}>{chrome.runtime.getManifest().version}</small>
                  </div>
        }

        return(
          <div className="App" key={"App"}>
            {header}
            <div className="App-subheader" key={'App-subheader-0'}>
              {subHeaderContent}
              <div className="BasketIcon" style={{display:(this.defaults.tabs===true?'none':'block')}} key={v4()}  >
                <IconButton color="primary"
                  aria-label="Basket"
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

          </div>
        )

    }
}

export default Popup
