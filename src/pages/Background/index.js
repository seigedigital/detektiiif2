import Defaults from '../../themes/active/Defaults.js'
import v2GetManifestThumbnail from './tools/iiif'

(function() {
    var globalDefaults = new Defaults()

    // var activeTab = chrome.tabs.TAB_ID_NONE;
    var tabStorage = {};
    var cache = {};
    var cache_cors = {};
    // var basket = {};
    var ignoreDomains = [];

    const networkFilters = {
        urls: [
            "<all_urls>"
        ]
    }

    // var theme = {
    //   tabs: false,
    //   singleView: 'MANIFESTS'
    // }


    //  get Messages
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


    function initTabStorage(tabId) {
        console.log("RESETTING "+tabId)
        // if(tabStorage[tabId]) {
        //     delete tabStorage[tabId].requests;
        //     delete tabStorage[tabId].iiif.manifests;
        //     delete tabStorage[tabId].iiif.images;
        //     delete tabStorage[tabId].iiif.collections;
        //     delete tabStorage[tabId].iiif;
            delete tabStorage[tabId];
        // };
        tabStorage[tabId] = {
            id: tabId,
            requests: {},
            iiif: {
                manifests: {},
                images: {},
                collections: {}
            },
            registerTime: new Date().getTime()
        };
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
      var tregex = /application\/([a-z]+\+)?json/i;
      // FIXME workaround to avoid problems chrome's cache vs dynamic cors headers, example: https://edl.beniculturali.it/beu/850013655
      // Upd: ran into troubles, switch back to force-cache, ignoring dynamic cors cases
      fetch(url, {method: 'HEAD', cache: 'force-cache', follow: 'follow', referrerPolicy: 'no-referrer'})
        .then((response) => {
            let c = response.headers.get("access-control-allow-origin");
            console.log("CORS: "+c+" for "+url);
            if( c==="*") {
              cache_cors[url]=true;
            } else {
              cache_cors[url]=false;
            }
            let t = response.headers.get("content-type");
            let s = response.headers.get("content-length");
            console.log(t+" "+s+" "+url);
            console.log(response.status);
            if( ( t && t.match(tregex)) || response.status!=200) { // bad implementations crash if you send them HEAD
              console.log("Accepted for GET Req: "+url);
              fetchWorkBody(url,tabId);
            } else {
              console.log("Rejected: "+url);
            }
        })
        .catch((error) => {
            cache[url] = false;
            console.debug('Error HEAD Req:', error);
            if(url.startsWith('http')) {
              console.log("Let's try GET... "+" // "+url);
              fetchWorkBody(url,tabId);
            }
        });
    }

    function fetchWorkBody(url,tabId) {
      if(!url.startsWith('http')) {
        console.log("URL denied (BODY), we're http(s) only.")
        return
      }

      let cm='no-store'
      if(cache_cors[url]===true) {
        let cm='force-cache';
      }

      // FIXME workaround to avoid problems chrome's cache vs dynamic cors headers, example: https://edl.beniculturali.it/beu/850013655
      fetch(url, {method: 'GET', cache: 'no-store', referrerPolicy: 'no-referrer'})
          .then(res => res.json())
          .then((data) => {
              cache[url] = data;
              compileData(url,tabId);
          })
          .catch((error) => {
              cache[url] = false;
              console.debug('Error GET Req:', error);
          });
    }

    function compileData(url,tabId) {
        let data = cache[url]

        let iiif = analyzeJSONBody(data,url);
        if(!iiif) {
            console.log("NO for "+url);
            return;
        }

        console.log("OK for "+url);
        if (!tabStorage.hasOwnProperty(tabId)) {
            initTabStorage(tabId);
        }

        // manifesto experiment
        // manifesto.loadManifest(url).then(function(manifest){
          // var m = manifesto.parseManifest(JSON.stringify(data));
          // console.log("MANIFESTO: "+manifesto.LanguageMap.getValue(m.getLabel(), 'en-gb'));
        // });

        let item = {}
        if('@id' in data) {
          item.id = data['@id']
        } else {
          item.id = data['id']
        }
        item.url = url
        item.cors = cache_cors[url]
        item.error = 0

        if(iiif.api=="presentation" && iiif.type=="manifest") {
            try {
              if (typeof data.label === 'string' || data.label instanceof String) {
                item.label = data.label;
              } else {
                item.label = data.label[0]['@value'];
              }
              item.thumb = v2GetManifestThumbnail(data)
            } catch(err) {
              console.error(err)
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
        if(item.label.length>40) {
            item.label=item.label.slice(0,36)+"...";
        }
        if(iiif.type=="manifest") {
            tabStorage[tabId].iiif.manifests[item.id] = item;
        } else if (iiif.type=="collection") {
            tabStorage[tabId].iiif.collections[item.id] = item;
        } else {
            tabStorage[tabId].iiif.images[item.id] = item;
        }
        // if(tabId==activeTab) {
        updateIcon()
        // }
    }

    function analyzeHTMLBody(doc,tabId) {

      console.log("ANALYZE HTML of Tab "+tabId)

      // Generic 1, should match e.g. National Museum Sweden
      let regex_generic1 = /(https\:\/\/[^\"]*(iiif|manifest)[^\"<]*)\"/gi;
      let params = [...doc.matchAll(regex_generic1)];
      if(params.length>100) {
        // FIXME do nice status in tab header, dont alert
        // alert("detektIIIF: limiting huge number of matches (case 1)");
        params=params.slice(0,10);
      }
      if(params) {
        params.forEach((hit, i) => {
          if(hit.length>1) {
            console.log("check guess type 1: "+hit[1]);
            fetchHttp(hit[1],tabId);
          }
        });
      }

      // Generic 2, intra-Link
      let regex_generic2 = /\"https[\"]*=(https\:\/\/[^\"\&]*(iiif|manifest)[^\"\&<]*)/gi;
      params = [...doc.matchAll(regex_generic2)];
      if(params.length>20) {
        alert("detektIIIF: limiting huge number of matches (case 2)"); // FIXME do nice status in tab header, dont alert
        params=params.slice(0,10);
      }
      if(params) {
        params.forEach((hit, i) => {
          if(hit.length>1) {
            console.log("check guess type 2: "+hit[1]);
            fetchHttp(hit[1],tabId);
          }
        });
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
            cache[url]=false; // that's no IIIF, block by cache rule
            return(false);
        }

        var ctx = body["@context"].split("/");
        // alert(JSON.stringify(ctx));

        if(ctx[2]!=="iiif.io" || ctx[3]!=="api") {
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
            iiif.type=false
        }

        return(iiif);
    }

    function updateIcon() {

      let queryOptions = { active: true, currentWindow: true }
      chrome.tabs.query(queryOptions, ([tab]) => {
        if(tab.id==chrome.tabs.TAB_ID_NONE) {
            return
        }
        let num = 0
        if(globalDefaults.tabs===true) {
          num = Object.keys(tabStorage[tab.id].iiif.manifests).length +
            Object.keys(tabStorage[tab.id].iiif.collections).length +
            Object.keys(tabStorage[tab.id].iiif.images).length
        } else {
          switch(globalDefaults.singleView) {
            case 'MANIFESTS':
              num = Object.keys(tabStorage[tab.id].iiif.manifests).length
              break
            case 'COLLECTIONS':
              num = Object.keys(tabStorage[tab.id].iiif.collections).length
              break
            case 'IMAGES':
              num = Object.keys(tabStorage[tab.id].iiif.images).length
              break
            default:
              break
          }
        }

        console.log("ICON NUM "+num)

        let mv = chrome.runtime.getManifest().manifest_version

        if(mv===3) {
          chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255],tabId:tab.id });
          if(typeof chrome.action.setBadgeTextColor === 'function' ) {
            chrome.action.setBadgeTextColor({ color: [255, 255, 255, 255],tabId:tab.id });
          }
          if(num>0)  {
            chrome.action.setBadgeText({text:num.toString(),tabId:tab.id});
          } else  {
            chrome.action.setBadgeText({text:'',tabId:tab.id});
          }

        } else {
          chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255],tabId:tab.id });
          if(typeof chrome.browserAction.setBadgeTextColor === 'function' ) {
            chrome.browserAction.setBadgeTextColor({ color: [255, 255, 255, 255],tabId:tab.id });
          }
          if(num>0)  {
            chrome.browserAction.setBadgeText({text:num.toString(),tabId:tab.id});
          } else  {
            chrome.browserAction.setBadgeText({text:num.toString(),tabId:tab.id});
          }
        }

      })
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
            console.log("IGNORED BY HOSTNAME ("+hostname+"), SETTING CACHE RULE: "+url);
            cache[url]=false;
            return true;
        }
        // console.log("GOOD: "+url);
        return false;
    }


    chrome.webRequest.onHeadersReceived.addListener((details) => {
        // console.log("HEADERS RECVD")
        // console.log(details)

        var { tabId, requestId, url, timeStamp, method } = details;

        if(tabId==chrome.tabs.TAB_ID_NONE) {
            return;
        }

        // console.log("URL: "+url);

        // tabId = fixTabId(tabId);

        if(filterURLs(url)) {
            return;
        }

        if (!tabStorage.hasOwnProperty(tabId)) {
            console.log("init tab "+tabId);
            initTabStorage(tabId);
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

        tabStorage[tabId].requests[requestId] = {
            requestId: requestId,
            url: details.url,
            startTime: details.timeStamp,
            cors: cors,
            status: 'pending'
        };
        // console.log(tabStorage[tabId].requests[requestId]);
    }, networkFilters, ["responseHeaders"]);


    chrome.webRequest.onCompleted.addListener((details) => {
        // console.log("WEBREQ COMPLETED")
        // console.log(details)

        var { tabId, requestId, url, timeStamp, method } = details;

        if(tabId==chrome.tabs.TAB_ID_NONE) {
            return;
        }

        if(filterURLs(url)) {
            return;
        }

        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }

        // console.debug("DETEKTIIIF CHECKING "+url);

        var request = tabStorage[tabId].requests[requestId];

        Object.assign(request, {
            endTime: details.timeStamp,
            responseHeaders: JSON.stringify(details.responseHeaders),
            requestDuration: details.timeStamp - request.startTime,
            status: 'complete'
        });

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

        // console.log(tabStorage[tabId].requests[details.requestId]);

    }, networkFilters, ["responseHeaders"]);

    function sendMsg(tabId) {
      if(document===undefined) {
        console.error("NO DOCUMENT DEFINED")
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
                target: {tabId: tabId},
                func: sendMsg,
                args: [tabId]
              },null
            )
          } else {
              chrome.tabs.executeScript({
                code: "chrome.runtime.sendMessage({type: 'docLoad', doc: document.documentElement.innerHTML, tabId:"+tabId+"});" // or 'file: "getPagesSource.js"'
              }, function(result) {
                if (chrome.runtime.lastError) {
                  // console.error(chrome.runtime.lastError.message);
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
        initTabStorage(tabId);
        updateIcon()
    });

    chrome.tabs.onActivated.addListener((tabInfo) => {
        console.log("tabs.Activated")
        console.log({actTab:tabInfo})

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
        // activeTab=tabId;
        if (!tabStorage.hasOwnProperty(tabId)) {
            console.log("NO INFO about "+tabId+" resetting tabStorage")
            initTabStorage(tabId);
        }
        updateIcon()

        console.log("GETTING TAB "+tabId)
        // chrome.tabs.get(tabId).then((tab) => {
        chrome.tabs.get(tabId, (tab) => {
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

    });

    chrome.tabs.onRemoved.addListener((tab) => {
        const tabId = tab.tabId;
        if(tabId==chrome.tabs.TAB_ID_NONE) {
            return;
        }
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
        delete tabStorage[tabId];
    });

    chrome.storage.onChanged.addListener(function (changes, namespace) {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

        if(namespace==="sync" &&  key==="ignoreDomains") {
          ignoreDomains=newValue
        }

        console.log(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`
        );
      }
    });

    ignoreDomains = globalDefaults.ignoreDomains
    chrome.storage.sync.get('ignoreDomains', function(data) {
      console.log({GOT:data})
    })


}());
