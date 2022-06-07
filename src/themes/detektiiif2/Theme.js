import React from 'react'

import './Styles.css'
import ThemeTemplate from '../_template/ThemeTemplate.js'

import LogoImageBig from './images/logo.svg'
import ZBLogo from './images/ZB_Logo_RGB_1024px.png'
import SDLogo from './images/seige.digital-768x170.png'

class Theme extends ThemeTemplate {

  title = "detektIIIF2"

  logoImageBig = LogoImageBig

  about = <div style={{overflow:'auto',marginBottom:'30px'}}>
            <h2 style={{marginTop:'0px'}}>About detektIIIF2</h2>

            <p style={{clear:'both',verticalAlign:'middle',padding:'0px 20px 0px 0px'}}><a href="https://detektiiif.net" target="_blank">https://detektiiif.net</a></p>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px 20px 20px 0px'}}><img src={SDLogo} style={{width:'150px',float:'right',paddingLeft:'30px'}} />Concept and Programming<br />Leander Seige, seige.digital GbR<br /><a href="https://seige.digital" target="_blank">https://seige.digital</a></p>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px 20px 20px 0px'}}><img src={ZBLogo} style={{width:'150px',float:'right',paddingLeft:'30px'}} />The development of detektIIIF 2 was generously funded and initiated by Zentralbibliothek Zürich.</p>

          </div>

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

}

export default Theme
