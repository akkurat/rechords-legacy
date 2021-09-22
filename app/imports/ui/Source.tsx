import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

interface SourcePropTypes {
  updateHandler: (t: string) => void
  readOnly: boolean
  md: string
  className: string
}

export default class Source extends Component<SourcePropTypes> {

static propTypes = {
  md: PropTypes.string.isRequired,
  updateHandler: PropTypes.func,
  readOnly: PropTypes.bool
};
  source = createRef<HTMLTextAreaElement>()

  constructor(props) {
    super(props);
  }

  callUpdateHandler = () => {
    if ('updateHandler' in this.props) {
      this.props.updateHandler(this.source.current.value);
    }
  }

  render() {
    // Height estimation
    let rows = this.props.md.match(/\n/g)

    if (rows != null) {
        rows = rows.length * 1.4 + 10;
    }

    rows = Math.max(50, rows);

    let style = {
        minHeight: rows + 'em',
    }

    return (
      <div className={"content " + this.props.className} id="sourceeditor">
          {this.props.children}
        <textarea 
          ref={this.source} 
          onChange={this.callUpdateHandler} 
          onSelect={ev => console.log(ev)}
          value={this.props.md} 
          style={style} 
          readOnly={this.props.readOnly}
        />
      </div>
    )
  }
}

