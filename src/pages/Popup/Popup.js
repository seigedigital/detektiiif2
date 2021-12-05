/*global chrome*/
import React, { Component } from 'react'

import Theme from '../../themes/active/Theme.js'

import {getCurrentTab} from "./common/Utils"
import DisplayCollection from "./components/DisplayCollection"
import DisplayManifest from "./components/DisplayManifest"
import DisplayImage from "./components/DisplayImage"
import DisplayBasket from "./components/DisplayBasket"

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Badge from '@mui/material/Badge';

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
        this.state = {
            manifests: {},
            collections: {},
            images: {},
            basket: {},
            settings: {
              showUrl: true
            },
            tab: 0 // 0=Manifests 1=Images 2=Collections 3=Basket
        }
        this.copyBasketCollection = this.copyBasketCollection.bind(this)
        this.openBasketCollection = this.openBasketCollection.bind(this)

        chrome.storage.sync.get('showUrl', (data) => {
          this.setState({settings:Object.assign({},this.state.settings,data)})
        })

    }

    componentDidMount() {
        getCurrentTab((tab) => {
            chrome.runtime.sendMessage({type: 'popupInit', tabId: tab.id, url: tab.url}, (response) => {
                if (response) {
                    console.log(
                      "Data for "+tab.id+" "+
                      JSON.stringify(response.iiif)
                    )
                    this.setState(Object.assign({},{...response.iiif},{basket:response.basket}))
                }
            })
        })
    }

    copyUrl(url) {
      navigator.clipboard.writeText(url).then(function() {
        alert("URL copied.")
      }, function() {
        alert("Copying URL failed.")
      })
    }

    addToBasket(key) {
      const newbasket = Object.assign(this.state.basket)
      newbasket[key] = this.state.manifests[key]
      this.setState({
        basket: newbasket
      })
      chrome.runtime.sendMessage({type: 'basketUpd', basket: this.state.basket})
    }

    buildBasketCollection() {
      var c = {
            "@context": "http://iiif.io/api/presentation/2/context.json",
            "@id": "https://detektiiif.manducus.net/invalid",
            "@type": "sc:Collection",
            "label": "custom detektIIIF collection",
            "manifests": []
      }
      for (var key in this.state.basket) {
        c.manifests.push({
            "@id": this.state.basket[key].id,
            "@type": "sc:Manifest",
            "label": this.state.basket[key].label
        })
      }
      return c
    }

    copyBasketCollection() {
      var c = this.buildBasketCollection()
      navigator.clipboard.writeText(JSON.stringify(c)).then(function() {
        alert("Collection copied.")
      }, function() {
        alert("Copying Collection failed.")
      })
    }

    openBasketCollection() {
      var c = this.buildBasketCollection()
      var form = document.createElement("form")
      form.setAttribute("method", "post")
      form.setAttribute("action", this.theme.postBasketCollectionTo[0].url)
      form.setAttribute("target", "_blank")
      var hiddenField = document.createElement("input")
      hiddenField.setAttribute("name", this.theme.postBasketCollectionTo[0].variable)
      hiddenField.setAttribute("value", JSON.stringify(c))
      form.appendChild(hiddenField)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }

    removeFromBasket(key) {
      const newbasket = Object.assign(this.state.basket)
      delete newbasket[key]
      this.setState({
        basket: newbasket
      })
      chrome.runtime.sendMessage({type: 'basketUpd', basket: newbasket})
    }

    clearBasket(key) {
      alert("CLEAR BASKET")
      const newbasket = {}
      this.setState({
        basket: newbasket
      })
      chrome.runtime.sendMessage({type: 'basketUpd', basket: newbasket})
    }



    render() {

        var cnn = Object.keys(this.state.collections).length
        var mnn = Object.keys(this.state.manifests).length
        var inn = Object.keys(this.state.images).length
        var bnn = Object.keys(this.state.basket).length

        let ms = []
        if(Object.keys(this.state.manifests).length>0) {
          for (var key in this.state.manifests) {
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
          for (var key in this.state.collections) {
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
          for (var key in this.state.images) {
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

        let bs = []
        if(Object.keys(this.state.basket).length>0) {
          for (var key in this.state.basket) {
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

        if(this.theme.tabs===true) {
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
            <div>
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
                <button onClick={() => this.openBasketCollection()} className="ButtonAddToBasket" key={"OPENBASKETCOLLECTION"}>OPEN IN M3</button>
                <button onClick={() => this.copyBasketCollection()} className="ButtonCopyBasket" key={"COPYBASKETCOLLECTION"}>Copy Basket Collection (JSON)</button>
                <button onClick={() => this.clearBasket()} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>Clear Basket</button>
                <br />
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
              break
            case 3:
              subHeaderContent.push(<h3 key={'TABB'} className="SubHeaderHeading">Basket ({bnn})</h3>)
              subHeaderContent.push(<button onClick={() => this.openBasketCollection()} className="ButtonAddToBasket" key={"OPENBASKETCOLLECTION"}>OPEN IN M3</button>)
              subHeaderContent.push(<button onClick={() => this.copyBasketCollection()} className="ButtonCopyBasket" key={"COPYBASKETCOLLECTION"}>Copy Basket Collection (JSON)</button>)
              subHeaderContent.push(<button onClick={() => this.clearBasket()} className="ButtonClearBasket" key={"CLEARBASKETCOLLECTION"}>Clear Basket</button>)
              break
            default:
              break
          }
          outputContent.push(
            <div>
                <TabPanel value={this.state.tab} index={0}>
                  {ms}
                </TabPanel>
                <TabPanel value={this.state.tab} index={1}>
                  {is}
                </TabPanel>
                <TabPanel value={this.state.tab} index={2}>
                  {cs}
                </TabPanel>
                <TabPanel value={this.state.tab} index={3}>
                  {bs}
                </TabPanel>
                <TabPanel value={this.state.tab} index={4}>
                  {this.theme.about}
                </TabPanel>
            </div>
          )
        }

        return(
          <div className="App">

            <div className="App-header" key={'App-header-0'}>
              <h2 className="App-title">{this.theme.title}<img src={this.theme.logoImage} className="Logo-image" /></h2>
              <small className="version">{chrome.runtime.getManifest().version}</small>
            </div>

            <div className="App-subheader" key={'App-subheader-0'}>
              {subHeaderContent}
              <div className="BasketIcon" style={{display:(this.theme.tabs===true?'none':'block')}}>
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

            <div className="App-footer" key={'Aoo-footer-0'}>
              <span>
                <a href="#" onClick={ () => { this.setState({tab:4}) } }>About</a>
                &nbsp;|&nbsp;
                <a href="#">Options</a>
              </span>
            </div>

          </div>
        )

    }
}

export default Popup
