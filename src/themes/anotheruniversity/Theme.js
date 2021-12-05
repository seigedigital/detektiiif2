import './Styles.css'
import ThemeTemplate from '../_template/ThemeTemplate.js'
import React from 'react'

class Theme extends ThemeTemplate {
  title = "AU University"
  about = <span>
            <h2>AU-DetektIIIF2</h2>
            <p>Provided by Another University</p>
            <p>Based on DetektIIIF2, developed by Leander Seige, seige.digital GbR</p>
            <p>On Github: <a href="https://github.com/seigedigital/detektiiif2" target="_blank">https://github.com/seigedigital/detektiiif2</a></p>
          </span>

  tabs = false
  singleView = 'MANIFESTS'
  separateBasket = true

  qualityChips = {
    cors: false,
    https: false,
    combined: true
  }

}

export default Theme
