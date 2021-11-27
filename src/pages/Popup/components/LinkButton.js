import React, { Component } from 'react';

export default class LinkButton extends Component {
  constructor(props) {
      super(props);
  }

  render() {
    return(
      <a
        href={this.props.link.url.replace("%%%URI%%%",this.props.uri)}
        target="_blank"
        className="ButtonOpenManifest"
      >
      { (this.props.lang in this.props.link.label) ? this.props.link.label[this.props.lang] : this.props.link.label['en'] }
      </a>
    )
  }


}
