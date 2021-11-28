import React, { Component } from 'react';
import { v4 } from 'uuid'
import { v5 } from 'uuid'

export default class LinkButton extends Component {
  constructor(props) {
      super(props);
  }

  render() {

    const MY_NAMESPACE = '1b671a63-40d3-4913-99b3-da01ff1f3343'
    let hashedurl=v5(this.props.uri, MY_NAMESPACE)

    return(
      <a
        href={this.props.link.url.replace("%%%URI%%%",this.props.uri)}
        target="_blank"
        className="ButtonOpenManifest"
        key={`innerlinkbutton-${hashedurl}`}
      >
      { (this.props.lang in this.props.link.label) ? this.props.link.label[this.props.lang] : this.props.link.label['en'] }
      </a>
    )
  }


}
