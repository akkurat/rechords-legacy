import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import TranposeSetter from "./TransposeSetter.jsx";
import ChrodLib from "../api/libchrod.js";
import Collapsed from './Collapsed.jsx';
import ReactDOM from 'react-dom';

import './Viewer.less'
var Parser = require("html-react-parser");

class Viewer extends Component {

  key = undefined 
  containerRef = undefined

  constructor() {
    super();
    this.state = { relTranspose: 0 };
    this.containerRef=React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.song == prevProps.song) return;
      
    // Song has changed.
    const node = ReactDOM.findDOMNode(this);
    node.children[0].scrollTop = 0;
    this.setState({ relTranspose: 0 });
  }

  handleContextMenu = event => {
    let m = this.props.match.params;
    this.props.history.push("/edit/" + m.author + "/" + m.title);
    event.preventDefault();
  };

  transposeSetter = pitch => {
    this.setState({ relTranspose: pitch });
  };

  render() {
    // Parse HTML to react-vdom and replace chord values.
    let vdom = this.createVdom();

    let options = []
    for (let i = 1; i < 6; i++) {
      options.push(<option key={i} value={i}>{i}</option>)
    }

    return (
      <div className="container">
        <div id="inlineSettings">
        <select id="overrideNumColumns" onChange={this.handleColDropdown}>
          <option value="auto">Auto</option>
          {options}
        </select>
          {this.containsLyrics(vdom) && 
          <section>
            <TranposeSetter
              transposeSetter={this.transposeSetter}
              transpose={this.state.relTranspose}
              keym={this.key}
            />
          </section>
          }
        </div>
        <div
          className="content chordsheet"
          id="chordsheet"
          onContextMenu={this.handleContextMenu}
        >
          <section ref={this.containerRef} id="chordSheetContent">
            {vdom}
          </section>
        </div>
        <Collapsed className="source" onClick={this.handleContextMenu}>
          <h1>bearbeiten</h1>
          <p>Schneller:&nbsp;Rechtsklick!</p>
        </Collapsed>
      </div>
    );
  }

  handleColDropdown = ( ev ) => {
    let cols = ev.target.value
    let element = this.containerRef.current
    if(cols == 'auto') {
      element.style['column-count'] = '';
    } else {
      element.style['column-count'] = ev.target.value; 
    }

  }
  
  containsLyrics() {
    let chords = this.props.song.getChords()
    return chords && chords.length>0
  }

  createVdom() {
    let chrodlib = new ChrodLib();
    let chords = this.props.song.getChords();
    let rmd_html = this.props.song.getHtml();

    this.key = ChrodLib.guessKey(chords);
    let key = this.key;


    // TODO: if key undef, write something there
    let dT = this.state.relTranspose;

    return Parser(rmd_html, {
      replace: function (domNode) {
        if (domNode.name && domNode.name == 'i' && 'data-chord' in domNode.attribs) {
          let chord = domNode.attribs['data-chord'];
          let t = chrodlib.transpose(chord, key, dT);
          let chord_;
          if (t == null) {
            chord_ = <span className="before">{chord}</span>;
          }
          else {
            chord_ = <span className={"before " + t.className}>{t.base}<sup>{t.suff}</sup></span>;
          }
          return <i>{chord_}{domNode.children[0].data}</i>;
        }
      }
    });
  }
}

Viewer.propTypes = {
  song: PropTypes.object.isRequired
};

Viewer.stateTypes = {
  columns: PropTypes.number
}


export default withRouter(Viewer); // injects history, location, match
