import Defaults from '../../themes/active/Defaults.js'
import { v2GetManifestThumbnail, v3GetManifestThumbnail } from './tools/iiif'
import { v4 } from 'uuid'

(function() {

    var globalDefaults = new Defaults()

    var tabStorage = {}
    var cache = {}
    var cache_cors = {}
    var ignoreDomains = []
    var animSequence = ['◐','◓','◑','◒']

    const networkFilters = {
        urls: [
            "<all_urls>"
        ]
    }

//
// FUNCTIONS
//


  function saveLocalTabStorage() {
    // console.log({saving:tabStorage})
    chrome.storage.local.set({tabStorage:JSON.stringify(tabStorage)})
  }

  function loadLocalTabStorage() {
    chrome.storage.local.get(['tabStorage'], (result) => {
      if('tabStorage' in result) {
        tabStorage = JSON.parse(result.tabStorage)
        for(let tabId in tabStorage) {
          tabStorage[tabId].badgeDisplay=''
        }
      }
    })
  }

    function getNewTabData(tabId) {
      // console.log({NEWdata:tabId})
      return({
        id: tabId,
        requests: {},
        fetch: [],
        truncated: false,
        badgeText: '',
        badgeDisplay: '',
        url: '',
        iiif: {
            manifests: {},
            images: {},
            collections: {}
        },
        registerTime: new Date().getTime()
      })
    }

    function initTabStorage(tabId) {
      // console.log("RESETTING "+tabId)
      tabStorage[tabId] = getNewTabData(tabId)
      saveLocalTabStorage()
      updateIcon(tabId)
    }

    function addToTabStorage(tabId,iiifkey,key,value) {
      console.log({ADDING:{iiifkey:iiifkey,key:key,value:value}})
      tabStorage[tabId]['iiif'][iiifkey][key]=value
      saveLocalTabStorage()
      updateIcon(tabId)
    }

    function updateInTabStorage(tabId,key,value) {
      // console.log({UPDInTab:{key:key,value:value}})
      if(! (tabId in tabStorage)) {
        tabStorage[tabId] = getNewTabData(tabId)
      }
      switch(key) {
        case 'updaterequest':
          for(let tid in tabStorage) {
            if(value.requestId in tabStorage[tid]['requests']) {
              tabStorage[tid]['requests'][value.requestId] = Object.assign({},tabStorage[tid]['requests'][value.requestId],value)
            }
          }
          break
        case 'addfetch':
          tabStorage[tabId]['fetch'].push(value)
          break
        case 'remfetch':
          tabStorage[tabId]['fetch'] = tabStorage[tabId]['fetch'].filter(function(item) {
            return item !== value
          })
          break
        case 'addrequest':
          tabStorage[tabId]['requests'][value.requestId]=Object.assign({},value)
        default:
          break
      }
      saveLocalTabStorage()
      updateIcon(tabId)
    }

    // ENTRY POINT
    function fetchHttp(url,tabId) {

      // let's go
      fetchWorkStart(url,tabId)

      // we always try https too
      if(url.startsWith("http:")) {
        fetchWorkStart(url.replace(/^http\:/i,"https:"),tabId)
      }

    }

    function fetchWorkStart(url,tabId) {
      // check Cache
      if(cache[url]!==undefined && cache[url]!=="INPROGRESS") {
        // known already? jusr recompile data
        compileData(url,tabId)
        return
      }
      // go check it out
      fetchWorkHeader(url,tabId)
    }

    function fetchWorkHeader(url,tabId) {
      if(!url.startsWith('http')) {
        console.log("URL denied (HEAD), we're http(s) only.")
        return
      }
      console.log("HEAD "+url)
      var tregex = /^application\/(ld\+)?json?.*/i
      // FIXME workaround to avoid problems chrome's cache vs dynamic cors headers, example: https://edl.beniculturali.it/beu/850013655
      // Upd: ran into troubles, switch back to force-cache, ignoring dynamic cors cases
      let fkey = v4()
      updateInTabStorage(tabId,'addfetch',fkey)
      fetch(url, {method: 'HEAD', cache: 'force-cache', follow: 'follow', referrerPolicy: 'no-referrer'})
        .then((response) => {
            if(response.status===405) {
              console.log(response)
              console.log("HEAD method not allowed. GETting...")
              fetchWorkBody(url,tabId)
            }
            let c = response.headers.get("access-control-allow-origin")
            // console.log("CORS: "+c+" for "+url)
            if( c==="*") {
              cache_cors[url]=true
            } else {
              cache_cors[url]=false
            }
            let t = response.headers.get("content-type")
            let s = response.headers.get("content-length")
            console.log(t+" "+s+" "+url)
            console.log(response.status)
            if( (t!==undefined && t.match(tregex))
              || (url.startsWith('https://www.e-manuscripta.ch/') && response.status===500) // e-manuscripta doesn't like HEAD requests
              || (url.startsWith('https://emanus.rc.vls.io') && response.status===500) // e-manuscripta doesn't like HEAD requests
              || (url.startsWith('https://www.e-rara.ch/') && response.status===500) // e-rara doesn't like HEAD requests
            )  {
              console.log("Accepted for GET Req: "+url)
              fetchWorkBody(url,tabId)
            } else {
              cache[url] = false
              console.log("Rejected: "+url)
            }
            updateInTabStorage(tabId,'remfetch',fkey)
        })
        .catch((error) => {
            updateInTabStorage(tabId,'remfetch',fkey)
            cache[url] = false
            console.debug('Error HEAD Req:', error)
            // if(url.startsWith('http') && !url.includes('?')) {
            //   console.log("Let's try GET... "+" // "+url)
            //   fetchWorkBody(url,tabId)
            // }
        })
    }

    function fetchWorkBody(url,tabId) {
      if(!url.startsWith('http')) {
        console.log("URL denied (BODY), we're http(s) only.")
        return
      }

      let cm='no-store'
      if(cache_cors[url]===true) {
        let cm='force-cache'
      }

      let fkey = v4()
      updateInTabStorage(tabId,'addfetch',fkey)
      // FIXME workaround to avoid problems chrome's cache vs dynamic cors headers, example: https://edl.beniculturali.it/beu/850013655
      fetch(url, {method: 'GET', cache: 'no-store', referrerPolicy: 'no-referrer'})
          .then(res => res.json())
          .then((data) => {
              console.log({got:data})
              cache[url] = data
              compileData(url,tabId)
              console.log("ADDing "+url+"to "+tabId)
              updateInTabStorage(tabId,'remfetch',fkey)
          })
          .catch((error) => {
              console.debug('Error GET Req:', error)
              cache[url] = false
              updateInTabStorage(tabId,'remfetch',fkey)
          })
    }

    function fetchHTML(url,tabId) {
      if(!url.startsWith('http')) {
        console.log("URL denied (fetchHTML), we're http(s) only.")
        return
      }
      fetch(url, {method: 'GET', cache: 'no-store', referrerPolicy: 'no-referrer'})
      .then(function (response) {
        return response.text()
      }).then(function (html) {
        // console.log(html)
        analyzeHTMLBody(html,tabId)
      }).catch(function (err) {
        // There was an error
        console.warn('Something went wrong.', err)
      })

    }

    function compileData(url,tabId) {
        console.log("compileData "+url)
        let data = cache[url]

        if(cache[url]===false) {
          console.log("cache denial for "+url)
          return
        }

        if(cache[url]==="INPROGRESS") {
          console.log("skipping INPROGRESS "+url)
          return
        }

        let iiif = analyzeJSONBody(data,url)
        if(!iiif) {
            cache[url] = false
            console.log("NO for "+url)
            return
        }
        console.log({IIIF:iiif})

        console.log("OK for "+url)

        let item = {}
        if('@id' in data) {
          item.id = data['@id']
        } else {
          item.id = data['id']
        }
        item.url = url
        item.cors = cache_cors[url]
        item.error = 0
        item.version = iiif.version

        if(iiif.api==="presentation" && iiif.type==="manifest") {
            console.log("is manifest")
            try {
              if (typeof data.label === 'string' || data.label instanceof String) {
                item.label = data.label
              } else {
                if('en' in data.label) {
                  item.label = data.label['en'][0]
                } else if( Array.isArray(data.label) && ('@value' in data.label[0]) ){
                  item.label = data.label[0]['@value']
                } else {
                  item.label = item.id
                }
              }
              console.log("LABEL: "+item.label)
              switch(iiif.version) {
                case 2:
                case "2":
                  console.log("xa")
                  item.thumb = v2GetManifestThumbnail(data)
                  break
                case 3:
                case "3":
                  console.log("xb")
                  item.thumb = v3GetManifestThumbnail(data)
                  break
                default:
                  console.log("xc")
                  item.thumb = "logo-small-grey.png"
                  break
              }

            } catch(err) {
              console.log("NO NO NO")
              console.log(err)
              item.error = 1
              item.label = url
              item.thumb = "logo-small-grey.png"
            }
        } else if (iiif.api=="image") {
            item.label = url
            switch(iiif.version) {
              case 2:
              case "2":
                item.thumb = data['@id']+'/full/100,/0/default.jpg'
                break
              case 3:
              case "3":
                item.thumb = data['id']+'/full/100,/0/default.jpg'
                break
              default:
                item.thumb = "logo-small-grey.png"
                break
            }
        } else {
            item.label = url
            item.thumb = "logo-small.png"
        }
        if(iiif.type=="manifest") {
            // tabStorage[tabId].iiif.manifests[item.id] = item
            addToTabStorage(tabId,'manifests',item.id,item)
        } else if (iiif.type=="collection") {
            try {
              if (typeof data.label === 'string' || data.label instanceof String) {
                item.label = data.label
              } else {
                if('en' in data.label) {
                  item.label = data.label['en'][0]
                } else if( Array.isArray(data.label) && ('@value' in data.label[0]) ){
                  item.label = data.label[0]['@value']
                } else {
                  item.label = item.id
                }
              }
              console.log("LABEL: "+item.label)
            } catch(err) {
              item.label = url
            }
            // tabStorage[tabId].iiif.collections[item.id] = item
            addToTabStorage(tabId,'collections',item.id,item)
        } else {
            // tabStorage[tabId].iiif.images[item.id] = item
            addToTabStorage(tabId,'images',item.id,item)
        }
        // if(tabId==activeTab) {
        console.log("compileData-END")
        updateIcon(tabId)
        // }
    }

    function analyzeHTMLBody(doc,tabId) {

      let url

      // Generic 1, should match e.g. National Museum Sweden
      let regex_generic1 = /(https\:\/\/[^\"<\ ]*(iiif|i3f|manifest)[^\"<\ ]*(?<!.jpg))/gi
      let allurls = [...doc.matchAll(regex_generic1)]
      let params = []
      for(let key in allurls) {
        if(!params.includes(allurls[key][1])) {
          params.push(allurls[key][1])
        }
      }
      if(params.length>19) {
        // FIXME do nice status in tab header, dont alert
        // alert("detektIIIF: limiting huge number of matches (case 1)")
        console.log("detektIIIF: limiting huge number of matches (case 1)")
        params=params.slice(0,19)
        tabStorage[tabId].truncated=true
        saveLocalTabStorage()

      }
      for(let key in params) {
        url = params[key]
        if(cache[url]===undefined) {
          console.log("check guess type 1: "+url)
          cache[url] = "INPROGRESS"
          fetchHttp(url,tabId)
        } else {
          // console.log("NO check type 1: "+url)
        }
      }

      // Generic 2, intra-Link
      let regex_generic2 = /http[^\"<\ ]*=(https\:\/\/[^\"\&]*(iiif|i3f|manifest)[^\"\&<]*)/gi
      allurls = [...doc.matchAll(regex_generic2)]
      params = []
      for(let key in allurls) {
        if(!params.includes(allurls[key][1])) {
          params.push(allurls[key][1])
        }
      }
      if(params.length>19) {
        console.log("detektIIIF: limiting huge number of matches (case 2)") // FIXME do nice status in tab header, dont alert
        params=params.slice(0,19)
        tabStorage[tabId].truncated=true
        saveLocalTabStorage()
      }
      for(let key in params) {
        url = params[key]
        if(cache[url]===undefined) {
          console.log("check guess type 2: "+url)
          cache[url] = "INPROGRESS"
          fetchHttp(url,tabId)
        } else {
          // console.log("NO check type 2: "+url)
        }
      }

      let regex_imageapi = /(https:\/\/[^\"\>]+\/)[maxful0-9,!]+\/[maxful0-9,!]+\/[0-9\!]{1,4}\/default\.jpg/gm
      allurls = [...doc.matchAll(regex_imageapi)]
      params = []
      for(let key in allurls) {
        if(!params.includes(allurls[key][1])) {
          params.push(allurls[key][1])
        }
      }
      if(params.length>19) {
        console.log("detektIIIF: limiting huge number of matches (case 3)") // FIXME do nice status in tab header, dont alert
        params=params.slice(0,19)
        tabStorage[tabId].truncated=true
        saveLocalTabStorage()
      }
      for(let key in params) {
        url = params[key]+"info.json"
        if(cache[url]===undefined) {
          console.log("check guess type 3: "+url)
          cache[url] = "INPROGRESS"
          fetchHttp(url,tabId)
        } else {
          // console.log("NO check type 3: "+url)
        }
      }

      // var offdoc = document.createElement('html')
      // offdoc.innerHTML = doc
      // var links = offdoc.getElementsByTagName('a')
      // for(var i = 0 i< links.length i++) {
      //   var link = links[i].href
      //   if(link.includes("iiif")) {
      //     console.log(link)
      //   }
      // }

    }

    function analyzeJSONBody(body,url) {
        // console.log({body:body})
        if(!body.hasOwnProperty("@context")) {
            console.log("NO @context")
            cache[url]=false // that's no IIIF, block by cache rule
            return(false)
        }

        var ctx = body["@context"].split("/")
        // alert(JSON.stringify(ctx))

        if(body["@context"]==="http://www.shared-canvas.org/ns/context.json") {
          var iiif = {
              api: "presentation",
              version: "2"
          }
        } else if(ctx[2]!=="iiif.io" || ctx[3]!=="api") {
            console.log("NO iiif")
            console.log({ctx:ctx})
            cache[url]=false // again. no IIIF, block by cache rule
            return false
        } else {
          var iiif = {
              api: ctx[4].toLowerCase(),
              version: ctx[5].toLowerCase()
          }
        }

        if(body.hasOwnProperty("@type")) {
            iiif.type=body["@type"].split(":")[1].toLowerCase()
        } else {
          if(body.hasOwnProperty("type")) {
              iiif.type=body["type"].toLowerCase()
          } else {
            iiif.type=false
          }
        }

        return(iiif)
    }

    function updateAllIcons() {
      for(let tabId in tabStorage) {
        chrome.tabs.get(parseInt(tabId), (tab) => {
            if(tab && tab.id!==chrome.tabs.TAB_ID_NONE) {
              updateIcon(parseInt(tabId))
            } else {
              console.log("Tab "+tabId+" not available. Deleting storage.")
              delete tabStorage[tabId]
              saveLocalTabStorage()
            }
        })
      }
    }

    function updateIcon(tabId) {
      try {
          // console.log("updateIcon "+tabId)

          if(! (tabId in tabStorage)) {
            console.log("NO tabId in result (updateIcon)")
            return
          }

          let pending = tabStorage[tabId].fetch.length>0
          if(!pending) {
            for (const [key, request] of Object.entries(tabStorage[tabId].requests)) {
              // console.log({req:request})
              if(request.status === 'pending') {
                pending = true
                break
              }
            }
          }

          // console.log("PENDING "+pending)

          let num = 0

            if(globalDefaults.tabs===true) {
              num = Object.keys(tabStorage[tabId].iiif.manifests).length +
                Object.keys(tabStorage[tabId].iiif.collections).length +
                Object.keys(tabStorage[tabId].iiif.images).length
            } else {
              switch(globalDefaults.singleView) {
                case 'MANIFESTS':
                  num = Object.keys(tabStorage[tabId].iiif.manifests).length
                  break
                case 'COLLECTIONS':
                  num = Object.keys(tabStorage[tabId].iiif.collections).length
                  break
                case 'IMAGES':
                  num = Object.keys(tabStorage[tabId].iiif.images).length
                  break
                default:
                  break
              }
            }

          // console.log("ICON NUM ("+tabId+")"+num)

          // hourglass unicode: '\u231b' (ugly)

          // console.log({TSBADGE:tabStorage[tabId]})
          // console.log("tabId: "+tabId)
          // console.log("NM: "+Object.keys(tabStorage[tabId].iiif.manifests).length)
          // console.log("NC: "+Object.keys(tabStorage[tabId].iiif.collections).length)
          // console.log("NI: "+Object.keys(tabStorage[tabId].iiif.images).length)
          // console.log("NUM: "+num)

          if(pending) {
            // chrome.action.setBadgeText({text:'P',tabId:tabId})
            tabStorage[parseInt(tabId)].badgeText='P'
          } else {
            // chrome.action.setBadgeText({text:num.toString(),tabId:tabId})
            tabStorage[parseInt(tabId)].badgeText=num>0?num.toString():''
          }

          // setIcon(tabStorage[parseInt(tabId)].badgeText,tabId)

      } catch {
        console.log("unknown error during updateIcon()")
      }
    }

    function eternalIconUpdateLoop() {
      for(let tabId in tabStorage) {
        let value = false
        let ptr = Math.floor((Date.now()/250)%animSequence.length)
        let save = false
        if(tabStorage[tabId].badgeText==='P') {
          value=animSequence[ptr]
        } else {
          value=tabStorage[tabId].badgeText
          if(tabStorage[tabId].truncated===true) {
            value=value+"+"
          }
          save = true
        }
        if(value!==undefined) {
          if(tabStorage[tabId].badgeDisplay!==value) {
            chrome.tabs.get(
                parseInt(tabId),
                () => {
                  if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message)
                  } else {
                      setIcon(value,parseInt(tabId))
                      tabStorage[tabId].badgeDisplay=value
                      if(save) {
                        saveLocalTabStorage()
                      }
                  }
                }
            )
          }
        }
      }
      setTimeout(eternalIconUpdateLoop,250)
    }

    function setIcon(value,tabId) {
      let mv = chrome.runtime.getManifest().manifest_version
      if(mv===3) {
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255],tabId:tabId })
        if(typeof chrome.action.setBadgeTextColor === 'function' ) {
          chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255],tabId:tabId })
        }
        chrome.action.setBadgeText({text:value,tabId:tabId})
      } else {
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255],tabId:tabId })
        if(typeof chrome.browserAction.setBadgeTextColor === 'function' ) {
          chrome.browserAction.setBadgeTextColor({ color: [255, 255, 255, 255],tabId:tabId })
        }
        chrome.browserAction.setBadgeText({text:value,tabId:tabId})
      }
    }

    function filterURLs(url) { // returns true=block, false=accept
        console.log("url: "+url)
        console.log({cacheFromUrl:cache[url]})
        if(cache[url]===false) {
            console.log("IGNORED BY CACHE RULE: "+url)
            return true
        } else if (cache.hasOwnProperty(url)) {
            console.log("ALLOWING URL BY CACHE: "+url)
            return false
        }

        let filter = ignoreDomains

        // console.log("matching "+url)
        var hostname = url.match(/^(https?\:)\/\/([^:\/]*)\/(.*)$/)
        if(!hostname) {
            console.log("NO REGEX MATCH: "+url)
            return true
        }
        hostname = hostname[2] // .split('.')
        // hostname = hostname[hostname.length-2]+"."+hostname[hostname.length-1]
        for(let key in filter) {
          // console.log("CHECKING if "+filter[key]+" ends with "+hostname)
          if(hostname.endsWith(filter[key])) {
              console.log("IGNORED BY HOSTNAME ("+hostname+"), SETTING CACHE RULE: "+url)
              cache[url]=false
              return true
          }
        }
        // console.log("GOOD: "+url)
        return false
    }

//
//  PROGRAM STARTS HERE
//


  chrome.runtime.onMessage.addListener((msg, sender, response) => {
      switch (msg.type) {
          case 'popupInit':
              console.log("POPUP INIT")
              console.log(tabStorage)
              //  send Info on current Tab
              response(Object.assign({},tabStorage[msg.tabId])) // ,{basket: basket}))
              break
          case 'docLoad':
              console.log("DOC RECIEVED")
              // console.log(msg.doc)
              if( typeof msg.doc === 'string' ) {
                // console.log(msg.doc.indexOf('manifest'))
                analyzeHTMLBody(msg.doc,msg.tabId)
              }
              break
          case 'fetchHTML':
              console.log("Getting iframe "+msg.url)
              fetchHTML(msg.url,msg.tabId)
              break
          // case 'basketUpd':
          //     console.log("BASKET WAS UPDATED")
          //     basket = msg.basket
          //     break
          default:
              response('unknown request')
              break
      }
  })


    chrome.webRequest.onHeadersReceived.addListener((details) => {
        // console.log("HEADERS RECVD")
        // console.log(details)

        var { tabId, requestId, url, timeStamp, method } = details

        if(tabId===chrome.tabs.TAB_ID_NONE) {
            return
        }

        // console.log("URL: "+url)

        // tabId = fixTabId(tabId)

        if(filterURLs(url)) {
            return
        }

        if (method!="GET") {
            cache[url]=false
            return
        }

        var accepted = false
        var cors = false

        for (let index = 0; index < details.responseHeaders.length; index++) {
            var item=details.responseHeaders[index]
            if(
                item.name.toLowerCase().includes("type") &&
                item.value.toLowerCase().includes("json")
            ) {
                accepted = true
            }
            if(
                item.name.toLowerCase().includes("access-control-allow-origin") &&
                item.value.toLowerCase().includes("*".toUpperCase())
            ) {
                cache_cors[url] = cors = true
            }
            if(item.name=="Content-Length" && item.value>1000000) {
                // console.log("discard(2) "+details.url)
                accepted = false
                cache[url]=false
                return
            }
        }

        if (accepted==false) {
            cache[url]=false
            return
        }

        // tabStorage[tabId].requests[requestId] = {
        //     requestId: requestId,
        //     url: details.url,
        //     startTime: details.timeStamp,
        //     cors: cors,
        //     status: 'pending'
        // }
        updateInTabStorage(tabId,'addrequest',{
            requestId: requestId,
            url: details.url,
            startTime: details.timeStamp,
            cors: cors,
            status: 'pending'
        })

        // console.log(tabStorage[tabId].requests[requestId])
    }, networkFilters, ["responseHeaders"])


    chrome.webRequest.onCompleted.addListener((details) => {

      let { tabId, requestId, url, timeStamp, method } = details

      if(tabId==chrome.tabs.TAB_ID_NONE) {
          return
      }

      if(filterURLs(url)) {
          return
      }

      updateInTabStorage(tabId,'updaterequest',{
          requestId: requestId,
          endTime: details.timeStamp,
          responseHeaders: JSON.stringify(details.responseHeaders),
          status: 'complete'
      })

        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return
        }

        // console.debug("DETEKTIIIF CHECKING "+url)

        if(cache.hasOwnProperty(url)) {
            console.debug("DETEKTIIIF CACHE HIT: "+url)
            if(cache[url]) {
                compileData(url,tabId)
                return
            }
        } else {
            console.debug("DETEKTIIIF CACHE MISS: "+url)
            fetchHttp(url,tabId)
        }
    }, networkFilters, ["responseHeaders"])

    function sendMsg(tabId) {
      console.log("sendMsg")
      if(document===undefined) {
        console.log("NO DOCUMENT DEFINED")
        return
      }

      chrome.runtime.sendMessage(
        {type: 'docLoad', doc: document.documentElement.innerHTML, tabId: tabId}
      )

      let container = document.documentElement || document.body

      console.log({container:container})

      let config = { attributes: true, childList: true, characterData: true, subtree:true }

      console.log("< YES NEW OBSERVER YES >")
      let observer = new MutationObserver(function(mutation) {
          console.log("MUTATION event")
          console.log({mutation:mutation})
          chrome.runtime.sendMessage(
            {type: 'docLoad', doc: document.documentElement.innerHTML, tabId: tabId}
          )
      })
      observer.observe(container, config)

      // let iframes = Array.from(document.getElementsByTagName("iframe"))
      // // let ifobservers = []
      // for(let key in iframes) {
      //   if(filterURLs(iframes[key].src)===false) {
      //     chrome.runtime.sendMessage(
      //       {type: 'fetchHTML', url: iframes[key].src, tabId: tabId}
      //     )
      //   }
      //
      //   // ifobservers[key] = new MutationObserver(function(mutation) {
      //   //     console.log("CCC")
      //   //     console.log(mutation)
      //   //     // chrome.runtime.sendMessage(
      //   //     //   {type: 'docLoad', doc: iframes[key].document.documentElement.innerHTML, tabId: tabId}
      //   //     // )
      //   // })
      //   // console.log("key: "+key)
      //   // console.log({iframe:iframes[key]})
      //   // ifobservers[key].observe(iframes[key].contentWindow.body,config)
      // }

    }

    function getAndObserve(tabId) {
      let mv = chrome.runtime.getManifest().manifest_version

          console.log("MV is " + mv)
          if(mv===3) {
            console.log("EXEC SCRIPT")
            chrome.scripting.executeScript({
                target: {tabId: parseInt(tabId)},
                func: sendMsg,
                args: [tabId]
              }, () => {
                console.log("What the fish?")
                if(chrome.runtime.lastError) {
                  console.log("Whoops.. " + chrome.runtime.lastError.message)
                } else {
                }
              }
            )

          } else {
              console.log("chrome.tabs.executeScript")
              chrome.tabs.executeScript({
                code:
                  this.sendMsg.toString()
                  + ```
                    sendMsg(${tabId})
                  ```// or 'file: "getPagesSource.js"'
              }, function(result) {
                if (chrome.runtime.lastError) {
                  console.log("tabs.executeScript: "+chrome.runtime.lastError.message)
                } else {
                  console.log(result)
                }
              })
          }

    }

    chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab) => {
        console.log("UPDATE TAB "+tabId)
        console.log(changeInfo)

        if(tabId==chrome.tabs.TAB_ID_NONE) {
          console.log("chrome.tabs.onUpdated: called on none-tab")
          return
        }

        if((typeof tab.url === 'string') && (!tab.url.startsWith('http'))) {
          return
        }

        // if(changeInfo.url) {
        //   if(tabStorage[tabId].url!==changeInfo.url) {
        //     tabStorage[tabId].url = changeInfo.url
        //     initTabStorage(tabId)
        //   }
        // }

        if(tabStorage[tabId]!==undefined) {
          tabStorage[tabId].badgeDisplay = ''
        }

        if(typeof tab.url === 'string') {
          let regex = /(https:\/\/[^\"\>]+\/)[maxful0-9,!]+\/[maxful0-9,!]+\/[0-9\!]{1,4}\/default\.jpg/gm
          let matches = tab.url.matchAll(regex)
          matches = [...matches]
          if(matches!==null && matches.length>0) {
            console.log({matches:matches})
            fetchHttp(matches[0][1]+"info.json",tabId)
          }
        }

        // if(filterURLs(tab.url)) {
        //   console.log("chrome.tabs.onUpdated: filtered URL "+tab.url)
        //   return
        // }

        if(changeInfo.status==='complete' || true) {
          console.log(tab)
          if(!filterURLs(tab.url)) {
            getAndObserve(tabId)
          }
          updateIcon(tabId)
        }
    })

    //

    chrome.tabs.onActivated.addListener((tabInfo) => {
        console.log({activatedTab:tabInfo})

        if(!tabInfo) {
          console.log("No tab, returning.")
          return
        }

        const tabId = tabInfo.tabId
        if(tabId===chrome.tabs.TAB_ID_NONE) {
            console.log("TAB_ID_NONE, returning.")
            return
        }

          console.log("ACTIVE TAB is "+tabId)
          console.log({tabStoragebytabid:tabStorage[tabId]})

          if(tabStorage[tabId]===undefined) {
              console.log("NO INFO about "+tabId+" resetting tabStorage")
              initTabStorage(tabId)
          }
          console.log("onActivated")
          updateIcon(tabId)

          console.log("GETTING TAB "+tabId)
          // chrome.tabs.get(tabId).then((tab) => {
          try {
            console.log("chrome.tabs.get")
            chrome.tabs.get(parseInt(tabId), (tab) => {
              console.log({tab:tab})
              // just give it a try
              fetchHttp(tab.url,tab.id)

              let rules = {
                europeana1: {
                  search: /https\:\/\/www\.europeana\.eu\/..\/item\/2020903\/([^\?\"]+).*/gi,
                  replace: 'https://api.smk.dk/api/v1/iiif/manifest/?id=$1'
                },
                nationalmuseumse1: {
                  search: /https\:\/\/nationalmuseumse\.iiifhosting\.com\/iiif\/([^\/]+)\//gi,
                  replace: 'https://nationalmuseumse.iiifhosting.com/iiif/$1/manifest.json'
                }
              }
              for(let key in rules) {
                for(let result of tab.url.matchAll(rules[key].search)) {
                  let guess = result[0].replace(rules[key].search,rules[key].replace)
                  fetchHttp(guess,tab.id)
                }
              }
            })
          } catch {
            console.log("Couldn't get Tab "+tabId)
          }
    })

    chrome.tabs.onReplaced.addListener((newTabId,oldTabId) => {
      console.log("onReplaced from:"+oldTabId+" to:"+newTabId)
      tabStorage[newTabId] = JSON.parse(JSON.stringify(tabStorage[oldTabId]))
      delete tabStorage[oldTabId]
      saveLocalTabStorage()
    })

    chrome.tabs.onRemoved.addListener((tabId) => {
      console.log("REM "+tabId)
      if(tabId===chrome.tabs.TAB_ID_NONE) {
          console.log("NO REM 1 "+tabId)
          return
      }

      if (!tabStorage.hasOwnProperty(tabId)) {
          console.log("NO REM 2 "+tabId)
          return
      }
      console.log("REMOVING "+tabId)
      delete tabStorage[tabId]
      saveLocalTabStorage()
    })

    chrome.storage.onChanged.addListener( (changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

        if(namespace==="" &&  key==="ignoreDomains") {
          ignoreDomains=newValue
        }

        if(namespace==='local') {
          updateAllIcons()
        }

        // console.log(
        //   `Storage key "${key}" in namespace "${namespace}" changed.`,
        //   `Old value was "${oldValue}", new value is "${newValue}".`
        // )
      }
    })

    ignoreDomains = globalDefaults.ignoreDomains
    chrome.storage.local.get('ignoreDomains', function(data) {
      console.log({GOT:data})
    })

    console.log("(RE)STARTED")
    loadLocalTabStorage()

    eternalIconUpdateLoop()

}())
