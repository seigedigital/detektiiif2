/*

  This file defines the theming options and default values of DetektIIIF2

*/

class ThemeTemplate {

  // Title
  title = "DetektIIIF Version 2"

  // Images
  basketImage = null
  closeBasketImage = null
  greenDotImage = null
  infoImage = null
  logoImage = null
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
    addToBasket: true
  }

  qualityChips = {
    cors: true,
    https: true,
    combined: false
  }

  openManifestLinks = [
    {
      url: 'https://universalviewer.io/uv.html?manifest=',
      label: {
        en: "Open in UV",
        de: "In UV öffnen"
      }
    },
    {
      url: 'https://demo.tify.rocks/demo.html?manifest=',
      label: {
        en: "Open in TIFY",
        de: "In TIFY öffnen"
      }
    },
    {
      url: 'https://manducus.net/m3?manifest=%%%URI%%%',
      label: {
        en: "Open in M3",
        de: "In M3 öffnen"
      }
    }
  ]
}

export default ThemeTemplate
