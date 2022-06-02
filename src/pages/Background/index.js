import Defaults from '../../themes/active/Defaults.js'
import { v2GetManifestThumbnail, v3GetManifestThumbnail } from './tools/iiif'
import { v4 } from 'uuid'

(function() {

    var globalDefaults = new Defaults()

    var tabStorage = {};
    var cache = {};
    var cache_cors = {};
    var ignoreDomains = [];
    var animSequence = ['◐','◓','◑','◒'] // ['.  ', '.. ', '...'];

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
      // console.log({ADDING:{iiifkey:iiifkey,key:key,value:value}})
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
        fetchWorkStart(url.replace(/^http\:/i,"https:"),tabId);
      }

    }

    function fetchWorkStart(url,tabId) {
      // check Cache
      if(url in cache) {
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
      console.log("HEAD "+url);
      var tregex = /^application\/(ld\+)?json(;profile=.+)?/i;
      // FIXME workaround to avoid problems chrome's cache vs dynamic cors headers, example: https://edl.beniculturali.it/beu/850013655
      // Upd: ran into troubles, switch back to force-cache, ignoring dynamic cors cases
      let fkey = v4()
      updateInTabStorage(tabId,'addfetch',fkey)
      fetch(url, {method: 'HEAD', cache: 'force-cache', follow: 'follow', referrerPolicy: 'no-referrer'})
        .then((response) => {
            let c = response.headers.get("access-control-allow-origin");
            // console.log("CORS: "+c+" for "+url);
            if( c==="*") {
              cache_cors[url]=true;
            } else {
              cache_cors[url]=false;
            }
            let t = response.headers.get("content-type");
            let s = response.headers.get("content-length");
            console.log(t+" "+s+" "+url);
            console.log(response.status);
            if( t!==undefined && t.match(tregex) )  { //  || response.status!=200) { // bad implementations crash if you send them HEAD
              console.log("Accepted for GET Req: "+url);
              fetchWorkBody(url,tabId);
            } else {
              cache[url] = false
              console.log("Rejected: "+url);
            }
            updateInTabStorage(tabId,'remfetch',fkey)
        })
        .catch((error) => {
            updateInTabStorage(tabId,'remfetch',fkey)
            cache[url] = false;
            console.debug('Error HEAD Req:', error);
            if(url.startsWith('http')) {
              console.log("Let's try GET... "+" // "+url);
              fetchWorkBody(url,tabId);
            }
        });
    }

    function fetchWorkBody(url,tabId) {
      console.log("a")
      if(!url.startsWith('http')) {
        console.log("URL denied (BODY), we're http(s) only.")
        return
      }

      let cm='no-store'
      if(cache_cors[url]===true) {
        let cm='force-cache';
      }
      console.log("b")

      let fkey = v4()
      updateInTabStorage(tabId,'addfetch',fkey)
      console.log("c")
      // FIXME workaround to avoid problems chrome's cache vs dynamic cors headers, example: https://edl.beniculturali.it/beu/850013655
      fetch(url, {method: 'GET', cache: 'no-store', referrerPolicy: 'no-referrer'})
          .then(res => res.json())
          .then((data) => {
              console.log({got:data})
              cache[url] = data;
              compileData(url,tabId);
              updateInTabStorage(tabId,'remfetch',fkey)
          })
          .catch((error) => {
              console.debug('Error GET Req:', error);
              cache[url] = false;
              updateInTabStorage(tabId,'remfetch',fkey)
          });
    }

    function compileData(url,tabId) {
        console.log("compileData")
        let data = cache[url]

        let iiif = analyzeJSONBody(data,url);
        if(!iiif) {
            console.log("NO for "+url);
            return;
        }
        console.log({IIIF:iiif})

        console.log("OK for "+url);

        let item = {}
        if('@id' in data) {
          item.id = data['@id']
        } else {
          item.id = data['id']
        }
        item.url = url
        item.cors = cache_cors[url]
        item.error = 0

        if(iiif.api==="presentation" && iiif.type==="manifest") {
            console.log("is manifest")
            try {
              if (typeof data.label === 'string' || data.label instanceof String) {
                item.label = data.label;
              } else {
                if('en' in data.label) {
                  item.label = data.label['en'][0];
                } else if( Array.isArray(data.label) && ('@value' in data.label[0]) ){
                  item.label = data.label[0]['@value'];
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
                  item.thumb = "logo-small-grey.png";
                  break
              }

            } catch(err) {
              console.log("NO NO NO")
              console.log(err)
              item.error = 1;
              item.label = url;
              item.thumb = "logo-small-grey.png";
            }
        } else if (iiif.api=="image") {
            item.label = url;
            item.thumb = data['@id']+'/full/100,/0/default.jpg';
        } else {
            item.label = url;
            item.thumb = "logo-small.png";
        }
        if(iiif.type=="manifest") {
            // tabStorage[tabId].iiif.manifests[item.id] = item;
            addToTabStorage(tabId,'manifests',item.id,item)
        } else if (iiif.type=="collection") {
            try {
              if (typeof data.label === 'string' || data.label instanceof String) {
                item.label = data.label;
              } else {
                if('en' in data.label) {
                  item.label = data.label['en'][0];
                } else if( Array.isArray(data.label) && ('@value' in data.label[0]) ){
                  item.label = data.label[0]['@value'];
                } else {
                  item.label = item.id
                }
              }
              console.log("LABEL: "+item.label)
            } catch(err) {
              item.label = url;
            }
            // tabStorage[tabId].iiif.collections[item.id] = item;
            addToTabStorage(tabId,'collections',item.id,item)
        } else {
            // tabStorage[tabId].iiif.images[item.id] = item;
            addToTabStorage(tabId,'images',item.id,item)
        }
        // if(tabId==activeTab) {
        console.log("compileData-END")
        updateIcon(tabId)
        // }
    }

    function analyzeHTMLBody(doc,tabId) {

      // Generic 1, should match e.g. National Museum Sweden
      let regex_generic1 = /(https\:\/\/[^\"<\ ]*(iiif|i3f|manifest)[^\"<\ ]*)/gi;
      let allurls = [...doc.matchAll(regex_generic1)];
      let params = []
      for(let key in allurls) {
        if(!params.includes(allurls[key][1])) {
          params.push(allurls[key][1])
        }
      }
      if(params.length>99) {
        // FIXME do nice status in tab header, dont alert
        // alert("detektIIIF: limiting huge number of matches (case 1)");
        console.log("detektIIIF: limiting huge number of matches (case 1)");
        params=params.slice(0,99);
        tabStorage[tabId].truncated=true
        saveLocalTabStorage()

      }
      for(let key in params) {
        console.log("check guess type 1: "+params[key]);
        fetchHttp(params[key],tabId);
      }

      // Generic 2, intra-Link
      let regex_generic2 = /http[^\"<\ ]*=(https\:\/\/[^\"\&]*(iiif|i3f|manifest)[^\"\&<]*)/gi;
      allurls = [...doc.matchAll(regex_generic2)];
      params = []
      for(let key in allurls) {
        if(!params.includes(allurls[key][1])) {
          params.push(allurls[key][1])
        }
      }
      if(params.length>99) {
        console.log("detektIIIF: limiting huge number of matches (case 2)"); // FIXME do nice status in tab header, dont alert
        params=params.slice(0,99);
        tabStorage[tabId].truncated=true
        saveLocalTabStorage()
      }
      for(let key in params) {
        console.log("check guess type 2: "+params[key]);
        fetchHttp(params[key],tabId);
      }

      // var offdoc = document.createElement('html');
      // offdoc.innerHTML = doc;
      // var links = offdoc.getElementsByTagName('a');
      // for(var i = 0; i< links.length; i++) {
      //   var link = links[i].href;
      //   if(link.includes("iiif")) {
      //     console.log(link);
      //   }
      // }

    }

    function analyzeJSONBody(body,url) {
        if(!body.hasOwnProperty("@context")) {
            console.log("NO @context")
            cache[url]=false; // that's no IIIF, block by cache rule
            return(false);
        }

        var ctx = body["@context"].split("/");
        // alert(JSON.stringify(ctx));

        if(ctx[2]!=="iiif.io" || ctx[3]!=="api") {
            console.log("NO iiif")
            cache[url]=false; // again. no IIIF, block by cache rule
            return false;
        }

        var iiif = {
            api: ctx[4].toLowerCase(),
            version: ctx[5].toLowerCase()
        }

        if(body.hasOwnProperty("@type")) {
            iiif.type=body["@type"].split(":")[1].toLowerCase();
        } else {
          if(body.hasOwnProperty("type")) {
              iiif.type=body["type"].toLowerCase();
          } else {
            iiif.type=false
          }
        }

        return(iiif);
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


          if(pending) {
            // chrome.action.setBadgeText({text:'P',tabId:tabId});
            tabStorage[parseInt(tabId)].badgeText='P'
          } else {
            // chrome.action.setBadgeText({text:num.toString(),tabId:tabId});
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
                    console.log(chrome.runtime.lastError.message);
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
        chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255],tabId:tabId });
        if(typeof chrome.action.setBadgeTextColor === 'function' ) {
          chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255],tabId:tabId });
        }
        chrome.action.setBadgeText({text:value,tabId:tabId});
      } else {
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255],tabId:tabId });
        if(typeof chrome.browserAction.setBadgeTextColor === 'function' ) {
          chrome.browserAction.setBadgeTextColor({ color: [255, 255, 255, 255],tabId:tabId });
        }
        chrome.browserAction.setBadgeText({text:value,tabId:tabId});
      }
    }

    function filterURLs(url) { // returns true=block, false=accept
        if(cache[url]===false) {
            // console.log("IGNORED BY CACHE RULE: "+url);
            return true;
        } else if (cache.hasOwnProperty(url)) {
            // console.log("ALLOWING URL BY CACHE: "+url);
            return false;
        }

        let filter = ignoreDomains

        // console.log("matching "+url)
        var hostname = url.match(/^(https?\:)\/\/([^:\/]*)(.*)$/);
        if(!hostname) {
            // console.log("NO REGEX MATCH: "+url);
            return true;
        }
        hostname = hostname[2].split('.');
        hostname = hostname[hostname.length-2]+"."+hostname[hostname.length-1];
        if(filter.includes(hostname)) {
            // console.log("IGNORED BY HOSTNAME ("+hostname+"), SETTING CACHE RULE: "+url);
            cache[url]=false;
            return true;
        }
        // console.log("GOOD: "+url);
        return false;
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
              break;
          case 'docLoad':
              console.log("DOC RECIEVED");
              analyzeHTMLBody(msg.doc,msg.tabId);
              break;
          // case 'basketUpd':
          //     console.log("BASKET WAS UPDATED");
          //     basket = msg.basket;
          //     break;
          default:
              response('unknown request');
              break;
      }
  });


    chrome.webRequest.onHeadersReceived.addListener((details) => {
        // console.log("HEADERS RECVD")
        // console.log(details)

        var { tabId, requestId, url, timeStamp, method } = details;

        if(tabId===chrome.tabs.TAB_ID_NONE) {
            return;
        }

        // console.log("URL: "+url);

        // tabId = fixTabId(tabId);

        if(filterURLs(url)) {
            return;
        }

        if (method!="GET") {
            cache[url]=false;
            return;
        }

        var accepted = false;
        var cors = false;

        for (let index = 0; index < details.responseHeaders.length; index++) {
            var item=details.responseHeaders[index];
            if(
                item.name.toLowerCase().includes("type") &&
                item.value.toLowerCase().includes("json")
            ) {
                accepted = true;
            }
            if(
                item.name.toLowerCase().includes("access-control-allow-origin") &&
                item.value.toLowerCase().includes("*".toUpperCase())
            ) {
                cache_cors[url] = cors = true;
            }
            if(item.name=="Content-Length" && item.value>1000000) {
                // console.log("discard(2) "+details.url);
                accepted = false;
                cache[url]=false;
                return;
            }
        }

        if (accepted==false) {
            cache[url]=false;
            return;
        }

        // tabStorage[tabId].requests[requestId] = {
        //     requestId: requestId,
        //     url: details.url,
        //     startTime: details.timeStamp,
        //     cors: cors,
        //     status: 'pending'
        // };
        updateInTabStorage(tabId,'addrequest',{
            requestId: requestId,
            url: details.url,
            startTime: details.timeStamp,
            cors: cors,
            status: 'pending'
        })

        // console.log(tabStorage[tabId].requests[requestId]);
    }, networkFilters, ["responseHeaders"]);


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
            return;
        }

        // console.debug("DETEKTIIIF CHECKING "+url);

        if(cache.hasOwnProperty(url)) {
            console.debug("DETEKTIIIF CACHE HIT: "+url);
            if(cache[url]) {
                compileData(url,tabId);
                return;
            }
        } else {
            console.debug("DETEKTIIIF CACHE MISS: "+url);
            fetchHttp(url,tabId);
        }
    }, networkFilters, ["responseHeaders"]);

    function sendMsg(tabId) {
      if(document===undefined) {
        console.log("NO DOCUMENT DEFINED")
        return
      }
      chrome.runtime.sendMessage(
        {type: 'docLoad', doc: document.documentElement.innerHTML, tabId: tabId}
      )
    }

    chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab) => {
        console.log("UPDATE TAB "+tabId)

        if(changeInfo.status === 'complete') {

          // console.log(changeInfo)

          if(!tab.url.startsWith('http')) {
            // console.log("Ignoring non-http")
            return
          }

          let mv = chrome.runtime.getManifest().manifest_version

          if(mv===3) {
            chrome.scripting.executeScript({
                target: {tabId: parseInt(tabId)},
                func: sendMsg,
                args: [tabId]
              },null
            )
          } else {
              console.log("chrome.tabs.executeScript")
              chrome.tabs.executeScript({
                code: "chrome.runtime.sendMessage({type: 'docLoad', doc: document.documentElement.innerHTML, tabId:"+tabId+"});" // or 'file: "getPagesSource.js"'
              }, function(result) {
                if (chrome.runtime.lastError) {
                  console.log("tabs.executeScript: "+chrome.runtime.lastError.message);
                } else {
                  console.log(result)
                }
              })
          }

        }

        if(!changeInfo.url) {
            console.log("NO URL INFO")
            console.log(changeInfo)
            return;
        }

        // alert("UPDATE");
        if(tabId==chrome.tabs.TAB_ID_NONE) {
            return;
        }
        // activeTab=tabId;
        // tabStorage[tabId] = null;
        console.log("initTabStorage from chrome.tabs.onUpdated.addListener")
        initTabStorage(tabId);
        console.log("onUpdated")
        updateIcon(tabId)
    });

    chrome.tabs.onActivated.addListener((tabInfo) => {
        console.log({activatedTab:tabInfo})

        if(!tabInfo) {
          console.log("No tab, returning.")
          return;
        }

        const tabId = tabInfo.tabId;
        if(tabId===chrome.tabs.TAB_ID_NONE) {
            console.log("TAB_ID_NONE, returning.")
            return;
        }

          console.log("ACTIVE TAB is "+tabId)
          console.log({tabStoragebytabid:tabStorage[tabId]})

          if(! (tabId in tabStorage)) {
              console.log("NO INFO about "+tabId+" resetting tabStorage")
              initTabStorage(tabId);
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
              // fetchHttp(tab.url,tab.id)

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
    });

    chrome.tabs.onReplaced.addListener((newTabId,oldTabId) => {
      console.log("onReplaced from:"+oldTabId+" to:"+newTabId)
      tabStorage[newTabId] = JSON.parse(JSON.stringify(tabStorage[oldTabId]))
      delete tabStorage[oldTabId]
      saveLocalTabStorage()
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      console.log("REM "+tabId)
      if(tabId==chrome.tabs.TAB_ID_NONE) {
          console.log("NO REM 1 "+tabId)
          return;
      }

      if (!tabStorage.hasOwnProperty(tabId)) {
          console.log("NO REM 2 "+tabId)
          return;
      }
      console.log("REMOVING "+tabId)
      delete tabStorage[tabId]
      saveLocalTabStorage()
    });

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
        // );
      }
    });

    ignoreDomains = globalDefaults.ignoreDomains
    chrome.storage.local.get('ignoreDomains', function(data) {
      console.log({GOT:data})
    })

    console.log("(RE)STARTED")
    loadLocalTabStorage()

    eternalIconUpdateLoop()

}());
