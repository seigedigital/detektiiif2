import React from 'react'
import ReactDOM from 'react-dom'

let miradorInstance = null

function syncBasketToMirador(newBasket) {
  console.log('syncBasketToMirador')
  console.log(newBasket)
  let miradorCat = miradorInstance.store.getState().catalog
  // Add New Resources
  for(let basketKey in newBasket) {
    let foundInMirador=false
    for(let miradorKey in miradorCat) {
      if(newBasket[basketKey].url===miradorCat[miradorKey].manifestId) {
        foundInMirador=true
      }
    }
    console.log(newBasket[basketKey].url+' add found '+foundInMirador)
    if(foundInMirador===false) {
      miradorInstance.store.dispatch({
        manifestId: newBasket[basketKey].url,
        manifestJson: undefined,
        payload: null,
        type: 'mirador/ADD_RESOURCE',
      })
    }
  }
  //Remove Old Resources
  for(let miradorKey in miradorCat) {
    let foundInBasket=false
    for(let basketKey in newBasket) {
      if(newBasket[basketKey].url===miradorCat[miradorKey].manifestId) {
        foundInBasket=true
      }
    }
    console.log(miradorCat[miradorKey].manifestId+' rem found '+foundInBasket)
    if(foundInBasket===false) {
      miradorInstance.store.dispatch({
        manifestId: miradorCat[miradorKey].manifestId,
        type: 'mirador/REMOVE_RESOURCE',
      })
    }
  }
}

function syncMiradorToBasket(newMirador) {
  console.log('syncMiradorToBasket')
  console.log(newMirador)
  chrome.storage.local.get(['basket'], (oldBasket) => {

    // Add New Resources
    for(let miradorKey in newMirador) {
      let foundInBasket=false
      for(let basketKey in oldBasket) {
        if(oldBasket[basketKey].url===newMirador[miradorKey].manifestId) {
          foundInBasket=true
        }
      }
      if(foundInBasket===false) {
        // add to new Basket
      }
    }
    //Remove Old Resources
    for(let basketKey in oldBasket) {
      let foundInMirador=false
      for(let miradorKey in newMirador) {
        if(oldBasket[basketKey].url===newMirador[miradorKey].manifestId) {
          foundInMirador=true
        }
      }
      if(foundInMirador===false) {
        delete oldBasket[basketKey]
      }
    }

  })
}

// Go!

chrome.storage.local.get(['basket'], (result) => {

  // instantiate Mirador
  let counter = 0
  let catalog = []
  let windows = []
  if(result.basket!==undefined) {
    for(let key in result.basket) {
      catalog.push({manifestId:result.basket[key].url})
      if(counter<4) {
        windows.push({manifestId:result.basket[key].url})
      }
      counter++
    }
  }
  miradorInstance = Mirador.viewer({
    id: 'mirador',
    workspace: { isWorkspaceAddVisible: true },
    windows: windows,
    catalog: catalog
  })

  // listen for basket changes
  chrome.storage.onChanged.addListener( (changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if(namespace==="local" &&  key==="basket") {
        syncBasketToMirador(newValue)
      }
    }
  })

  // listen for mirador changes
  miradorInstance.store.subscribe(() => {
    let catalog = miradorInstance.store.getState().catalog
    syncMiradorToBasket(catalog)
  })

})
