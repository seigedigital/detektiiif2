/*

  This file defines the theming options and default values of DetektIIIF2

*/
import React from 'react'

class ThemeTemplate {

  // Title
  title = "DetektIIIF Version 2"
  about = <span>About DetektIIIF.</span>

  // Options
  optionsDescription= <p>This is the DetektIIIF Options page.</p>

  optionsSwitches = {
    viewManifestUrls: true,
    viewManifestInfo: false
  }

  optionsLists = {
    openManifestLinks: true,
    openCollectionLinks: true,
    excludeWebsites: true
  }

  optionsLogoImage = null
  optionsSecondaryLogoImage = null

  optionsPunchline = <span>Options</span>

  basketName = "Basket"

  // Images
  basketImage = null
  removeAllBasketImage = null
  closeBasketImage = null
  greenDotImage = null
  infoImage = null
  logoImage = null
  logoImageBig = null
  logoSecondaryImageBig = null
  redDotImage = null
  trashcanImage= null

  texts = {
    manifestInfoIcon: "This is a manifest."
  }

  // List Items

  generalButtons = {
    copyURL: true,
    addToBasket: true,
    removeFromBasket: true,
    downloadFullImage: true // only for images
  }

  qualityChips = {
    cors: true,
    https: true,
    urlid: true,
    hideok: true,
    combined: false
  }

  openManifestLinks = {
    uv: {
      url: 'https://universalviewer.io/uv.html?manifest=%%%URI%%%',
      tabBasket: false,
      tabManifests: true,
      backgroundColor: "#5e724d",
      label: {
        en: "Open in UV",
        de: "In UV öffnen"
      }
    },
    tify: {
      url: 'https://demo.tify.rocks/demo.html?manifest=%%%URI%%%',
      tabBasket: false,
      tabManifests: true,
      backgroundColor: "#5e724d",
      label: {
        en: "Open in TIFY",
        de: "In TIFY öffnen"
      }
    },
    manducus: {
      url: 'https://manducus.net/m3?manifest=%%%URI%%%',
      tabBasket: false,
      tabManifests: true,
      backgroundColor: "#5e724d",
      label: {
        en: "Open in M3",
        de: "In M3 öffnen"
      }
    }
  }

  // Basket

  postBasketCollectionTo = {
    manducus: {
      url: 'https://manducus.net/m3/index.php',
      mode: 'x-www-form-urlencoded', // or json
      variable: 'collection', // for x-www-form-urlencoded only
      tabBasket: true,
      tabCollections: true,
      tooltip: "Open your collection in Mirador.",
      options: {
        hidden: false
      },
      label: {
        en: "Open Collection in M3",
        de: "Kollektion In M3 öffnen"
      }
    }

  }

}

export default ThemeTemplate
