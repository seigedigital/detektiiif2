import React, { Component } from 'react';
import { v4 } from 'uuid'
import { v5 } from 'uuid'

import Tooltip from '@mui/material/Tooltip';

export default class PostButton extends Component {
  constructor(props) {
      super(props)
      this.openBasketCollection = this.openBasketCollection.bind(this)
  }

  openBasketCollection() {
    let c = this.props.buildBasketCollection(this.props.basket)
    let form = document.createElement("form")
    form.setAttribute("method", "post")
    form.setAttribute("action", this.props.link.url)
    form.setAttribute("target", "_blank")
    let hiddenField = document.createElement("input")
    hiddenField.setAttribute("name", this.props.link.variable)
    hiddenField.setAttribute("value", JSON.stringify(c))
    form.appendChild(hiddenField)
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  render() {
    let hashedurl=v5(this.props.link.url, '1b671a63-40d3-4913-99b3-da01ff1f3343')
    return(
      <Tooltip title={this.props.link.tooltip}>
        <button onClick={() => this.openBasketCollection()} className="ButtonAddToBasket" key={`postbutton-button-${hashedurl}`}>
          {this.props.link.label[this.props.lang]}
        </button>
      </Tooltip>
    )
  }


}
