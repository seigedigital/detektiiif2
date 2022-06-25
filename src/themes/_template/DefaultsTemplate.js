class DefaultsTemplate {

  // Navigation
  tabs = true
  showTabs = ['MANIFESTS','IMAGES','COLLECTIONS','BASKET']
  singleView = 'MANIFESTS'
  separateBasket = false

  storeBasket = "local" // or sync but not now because we should make sure that sync works

  ignoreDomains = [
    "google.com", "googleusercontent.com", "gstatic.com", "google.de", "googletagservices.com",

    "twitter.com", "twimg.com",

    "linkedin.com",

    "paypal.com",

    "ebay.de", "ebay.com", "ebaystatic.com", "ebayimg.com",

    "amazon.de", "amazon.com", "amazon.co.uk",

    "reddit.com",

    "yahoo.com", "yahoo.de",

    "youtube.com",

    "netflix.com",

    "instagram.com",

    "twitch.tv",

    "roblox.com",

    "facebook.com", "fbcdn.net",

    "sparkasse-leipzig.de"
  ]


}

export default DefaultsTemplate
