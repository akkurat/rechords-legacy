import { Component } from "react";
// AAARG, don't get while importing 
// React from 'react' is not enough. Anyways, it works now more or less
// however, the state and history are not well typed yet
import * as React from 'react';
import PropTypes from "prop-types";
import { withRouter  } from "react-router-dom";
// import { RouteProps } from "@types/react-router";
import TranposeSetter from "./TransposeSetter";
import ChrodLib from "../api/libchrod";
import { RmdHelpers, Song } from "../api/collections";
import Collapsed from './Collapsed';
// import { Parser } from "html-react-parser";

var Parser = require("html-react-parser");

interface ViewerProps {
  song: Song
  // Work around (somewhere there should be 
  // an existing interface to inherit from
  // or merge it with
  // TODO: add links from matti
  // : merge with a withrouterprops
  match: any
  history: any
}

interface ViewerState {
  relTranspose?: number
}

const Viewer = withRouter<{}>(
  class Viewer_ extends Component<ViewerProps, ViewerState> {
  constructor(props: ViewerProps) {
    super(props);
    this.state = { relTranspose: 0 };
  }
  // state: {relTranspose : number}

  handleContextMenu = event => {
    let m = this.props.match.params;
    this.props.history.push("/edit/" + m.author + "/" + m.title);
    event.preventDefault();
  };

  handleTransposeSetter = (pitch: number) => {
    this.setState({ relTranspose: pitch });
  };

  render() {
    let chords = this.props.song.getChords();
    let chrodlib = new ChrodLib();
    let rmd_html = this.props.song.getHtml();

    let keym = ChrodLib.guessKey(chords);

    // TODO: if key undef, write something there

    let dT = this.state.relTranspose;

    // Parse HTML to react-vdom and replace chord values.
    let vdom = Parser(rmd_html, {
      replace: function(domNode) {
        if (domNode.name && domNode.name == 'i') {
          let chord = domNode.attribs['data-chord'];
          if (chord) {
            let chord_transposed_data = chrodlib.transpose(chord, keym, dT);
            domNode.attribs["data-chord"]= chord_transposed_data;
          }
          // return <span className="chord">{c}</span>
          return domNode;
        }
      }
    });

    // Idee: obige replace-funktion könnte vom TransposeSetter geholt werden. Dadurch könnte der relTranspose-Zustand völlig in 
    // den TransposeSetter wandern. 
    // True that -> put on refactoring
    // Problem: the info of all chords is needed (for guessing the key)
    // Or just give the key to the Component 



    return (
      <div className="container">
        <div
          className="content chordsheet"
          id="chordsheet"
          onContextMenu={this.handleContextMenu}
        >
          <section>
            <TranposeSetter 
              doShit={this.handleTransposeSetter}
              initialTranspose={this.state.relTranspose}
              keym={keym}
            />
          </section>
          <section ref="html">
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
});

export default Viewer;
