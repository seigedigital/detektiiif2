class DefaultsTemplate {

  // Navigation
  tabs = true
  showTabs = ['MANIFESTS','IMAGES','COLLECTIONS','BASKET']
  singleView = 'MANIFESTS'
  separateBasket = false

  storeBasket = "local" // or sync but not know because we should make sure that sync works

  ignoreDomains = [
    "google.com", "googleusercontent.com", "gstatic.com", "google.de",
    "twitter.com", "linkedin.com", "paypal.com", "ebay.de",
    "ebay.com", "ebaystatic.com", "ebayimg.com", "googletagservices.com",
    "amazon.de", "amazon.com", "amazon.co.uk", "reddit.com", "facebook.com",
    "yahoo.com", "yahoo.de", "fbcdn.net", "youtube.com", "netflix.com",
    "instagram.com", "twitch.tv", "twimg.com"
  ]


}

export default DefaultsTemplate
