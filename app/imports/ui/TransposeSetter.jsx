import React, { Component } from "react";
import ChrodLib from "../api/libchrod.js";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import Tooltip from 'rc-tooltip';
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css"
import './transpose-setter.less'

const Handle = Slider.Handle


export default class TranposeSetter extends Component {
  constructor(props) {
    super(props);
    this.keyObjs = {}
  }

  handleSlider = value => {
    this.props.transposeSetter(Number.parseInt(value));
  };

  tipFormatter = v => {
    return v;
  }

  // Inherited from React.Component
  render() {
    let marks = {};
    if ( this.props.keym) {
      let key = this.props.keym;
      let keys = {};
      this.keyObjs = {};
      let libChrod = new ChrodLib();
      for (let i=-7; i<=7; i++) {
        let keyobj = libChrod.shift(key, i);
        this.keyObjs[i] = keyobj;
        const pm = i > 0 ? '+' : ' '
        keys[i] =<><i>{keyobj.key}</i>{pm + i}</> ;  
        if (i==0) { keys[i] = <><i>{keyobj.key}</i> {keyobj.scale}</> }
      }
      marks = keys;
    } else {
      for (let i = -7; i <= 7; i++) {
        const pm = i>0 ? '+': ' '
        this.keyOjbs[i] = {key: i, scale: '?'};
        marks[i] = pm + i + ' ht'
      }
    }
    return (
      // TODO: responsive-> for size s change to 
      <div id="transposer">
          <Slider
            id="typeinp"
            min={-7}
            max={7}
            name="relTranspose"
            handle = {this.handle}
            value={this.props.transpose}
            onChange={this.handleSlider}
            marks = {marks}
            step={1}
            included = {false}
            tipFormatter = {this.tipFormatter}
            dots
            vertical={true}
          />
      </div>
    );
  }

  handle = (props) => {
    // <Handle value={value} {...restProps} />
    const { className, tipTransitionName, tipFormatter, vertical, offset, value } = props;
    const { dragging, noTip } = props;

    const style = vertical ? { bottom: offset + '%' } : { left: offset + '%' };
    const handle = (<div className={className} style={style}>
      {this.keyObjs[value].key}
    </div>);

    return handle;
  };


}

TranposeSetter.propTypes = {
  transposeSetter: PropTypes.func,
  transpose: PropTypes.number,
  key: PropTypes.string
};
