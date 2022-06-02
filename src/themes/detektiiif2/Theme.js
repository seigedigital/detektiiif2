import React from 'react'

import './Styles.css'
import ThemeTemplate from '../_template/ThemeTemplate.js'

import LogoImageBig from './images/logo.svg'
import ZBLogo from './images/ZB_Logo_RGB_1024px.png'
import SDLogo from './images/seige.digital-768x170.png'

class Theme extends ThemeTemplate {

  title = "detektIIIF22"

  logoImageBig = LogoImageBig

  about = <span>
            <h2>About detektIIIF2</h2>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px 20px 20px 0px'}}><img src={SDLogo} style={{width:'150px',float:'right',paddingLeft:'20px'}} />Concept and Programming<br />Leander Seige, seige.digital GbR<br /><a href="https://seige.digital" target="_blank">https://seige.digital</a></p>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px 20px 20px 0px'}}><img src={ZBLogo} style={{width:'150px',float:'right',paddingLeft:'20px'}} />The development of detektIIIF 2 was generously funded and initiated by Zentralbibliothek Zürich.</p>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px 20px 20px 0px'}}>Sources can be found on Github: <a href="https://github.com/seigedigital/detektiiif2" target="_blank">https://github.com/seigedigital/detektiiif2</a></p>
          </span>

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
