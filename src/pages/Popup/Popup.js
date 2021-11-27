/*global chrome*/
import React, { Component } from 'react'

import Theme from '../../themes/Selector.js'

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

    // const [value, setValue] = React.useState(0);
    //
    // const handleChange = (event, newValue) => {
    //   setValue(newValue);
    // };

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
      form.setAttribute("action", "https://manducus.net/m3/index.php")
      form.setAttribute("target", "_blank")
      var hiddenField = document.createElement("input")
      hiddenField.setAttribute("name", "collection")
      hiddenField.setAttribute("value", JSON.stringify(c))
      form.appendChild(hiddenField)
      document.body.appendChild(form)
      form.submit()
    }

    removeFromBasket(key) {
      const newbasket = Object.assign(this.state.basket)
      delete newbasket[key]
      this.setState({
        basket: newbasket
      })
      chrome.runtime.sendMessage({type: 'basketUpd', basket: this.state.basket})
    }



    render() {

        var cnn = Object.keys(this.state.collections).length
        var mnn = Object.keys(this.state.manifests).length
        var inn = Object.keys(this.state.images).length
        var bnn = Object.keys(this.state.basket).length

        let stat =
        <div className="App-status">
          <a href="#ancc">collections: {cnn}</a> |
          <a href="#ancm">manifests: {mnn}</a> |
          <a href="#anci">images: {inn}</a>
        </div>

        let ms = []
        if(Object.keys(this.state.manifests).length>0) {
          ms.push(<h3 key={'TABM'}>Available Manifests<a name="ancm" /></h3>)
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
          bs.push(<h3 key={'TABB'}>Basket<a name="ancb" /></h3>)
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

        let outputContent = []

        if(this.theme.tabs===true) {
          outputContent.push(
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={this.state.tab} onChange={(e,v)=>{this.setState({tab:v})}} aria-label="basic tabs example">
                  <Tab label="Manifests" value={0} {...a11yProps(0)} />
                  <Tab label="Images" value={1} {...a11yProps(1)} />
                  <Tab label="Collections" value={2}  {...a11yProps(2)} />
                  <Tab label="Basket" value={3} {...a11yProps(3)} />
                </Tabs>
              </Box>
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
            </Box>
          )
        } else {
          outputContent.push(
            <Box sx={{ width: '100%' }}>
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
            </Box>
          )
        }

        return(
          <div className="App">

            <header className="App-header" key={'App-header-0'}>
              <h2 className="App-title">{this.theme.title}<img src={this.theme.logoImage} className="Logo-image" /></h2>
              <small className="version">{chrome.runtime.getManifest().version}</small>
            </header>

            <div className="App-subheader" key={'App-subheader-0'}>
              <div className="BasketIcon">
                <IconButton color="primary"
                  aria-label="Basket"
                  component="span"
                  onClick={ () => {
                    this.setState({tab: this.state.tab===3?0:3 })
                  } }
                >
                  <Badge badgeContent={Object.keys(this.state.basket).length} className="BasketBadge">
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

            <div className="App-body"  key={'App-body-0'}>
              {outputContent}
            </div>

          </div>
        )

    }
}

export default Popup



// WORKING DEMO
//
// import * as React from 'react';
// import PropTypes from 'prop-types';
// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
// import Typography from '@mui/material/Typography';
// import Box from '@mui/material/Box';
//
// function TabPanel(props) {
//   const { children, value, index, ...other } = props;
//
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && (
//         <Box sx={{ p: 3 }}>
//           <Typography>{children}</Typography>
//         </Box>
//       )}
//     </div>
//   );
// }
//
// TabPanel.propTypes = {
//   children: PropTypes.node,
//   index: PropTypes.number.isRequired,
//   value: PropTypes.number.isRequired,
// };
//
// function a11yProps(index) {
//   return {
//     id: `simple-tab-${index}`,
//     'aria-controls': `simple-tabpanel-${index}`,
//   };
// }
//
// export default function Popup() {
//   const [value, setValue] = React.useState(0);
//
//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };
//
//   return (
//     <Box sx={{ width: '100%' }}>
//       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//       <h1>HIIII!!!!</h1>
//         <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
//           <Tab label="Item One" {...a11yProps(0)} />
//           <Tab label="Item Two" {...a11yProps(1)} />
//           <Tab label="Item Three" {...a11yProps(2)} />
//         </Tabs>
//       </Box>
//       <TabPanel value={value} index={0}>
//         Item One
//       </TabPanel>
//       <TabPanel value={value} index={1}>
//         Item Two
//       </TabPanel>
//       <TabPanel value={value} index={2}>
//         Item Three
//       </TabPanel>
//     </Box>
//   );
// }
