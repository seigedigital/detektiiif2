/*

  This file defines the theming options and default values of DetektIIIF2

*/
import React from 'react'

class ThemeTemplate {

  // Title
  title = "DetektIIIF Version 2"
  about = <span>
            <h2>DetektIIIF2</h2>
            <p>developed by Leander Seige, seige.digital GbR</p>
            <p>On Github: <a href="https://github.com/seigedigital/detektiiif2" target="_blank">https://github.com/seigedigital/detektiiif2</a></p>
          </span>

  // Options
  optionsDescription= <p>This is the DetektIIIF Options page.</p>

  optionsSwitches = {
    viewManifestUrls: true,
  }

  optionsLists = {
    openManifestLinks: true,
    excludeWebsites: true
  }

  optionsLogoImage = null

  optionsPunchline = <span>Options</span>

  // Images
  basketImage = null
  closeBasketImage = null
  greenDotImage = null
  infoImage = null
  logoImage = null
  logoImageBig = null
  redDotImage = null
  trashcanImage= null

  // Navigation
  tabs = true
  showTabs = ['MANIFESTS','IMAGES','COLLECTIONS','BASKET']
  singleView = 'MANIFESTS'
  separateBasket = false

  // List Items

  generalButtons = {
    copyURL: true,
    addToBasket: true,
    removeFromBasket: true
  }

  qualityChips = {
    cors: true,
    https: true,
    combined: false
  }

  openManifestLinks = {
    uv: {
      url: 'https://universalviewer.io/uv.html?manifest=%%%URI%%%',
      label: {
        en: "Open in UV",
        de: "In UV öffnen"
      }
    },
    tify: {
      url: 'https://demo.tify.rocks/demo.html?manifest=%%%URI%%%',
      label: {
        en: "Open in TIFY",
        de: "In TIFY öffnen"
      }
    },
    m3: {
      url: 'https://manducus.net/m3?manifest=%%%URI%%%',
      label: {
        en: "Open in M3",
        de: "In M3 öffnen"
      }
    }
  }

  // Basket

  postBasketCollectionTo = [
    {
      url: 'https://manducus.net/m3/index.php',
      mode: 'wwwformdata',
      variable: 'collection',
      label: {
        en: "Open Collection in M3",
        de: "Kollektion In M3 öffnen"
      }
    }
  ]

}

export default ThemeTemplate
