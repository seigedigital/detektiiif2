import React from 'react'

import './Styles.css'
import ThemeTemplate from '../_template/ThemeTemplate.js'

import LogoImageBig from './images/logo5.svg'
import ZBLogo from './images/ZB_Logo_RGB_1024px.png'
import SDLogo from './images/seige.digital-768x170.png'

class Theme extends ThemeTemplate {

  title = "DetektIIIF Version 2"

  logoImageBig = LogoImageBig

  about = <span>
            <h2>About detektIIIF 2</h2>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px'}}><img src={SDLogo} style={{width:'150px',float:'right',paddingLeft:'20px'}} />Concept and Programming<br />Leander Seige (seige.digital GbR)</p>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px'}}><img src={ZBLogo} style={{width:'150px',float:'right',paddingLeft:'20px'}} />The development of detektIIIF 2 was generously funded and initiated by Zentralbibliothek Zürich.</p>

            <p style={{clear:'both',verticalAlign:'middle',padding:'20px'}}>Sources can be found on Github: <a href="https://github.com/seigedigital/detektiiif2" target="_blank">https://github.com/seigedigital/detektiiif2</a></p>
          </span>

}

export default Theme
