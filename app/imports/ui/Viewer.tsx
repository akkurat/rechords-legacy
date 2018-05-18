import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter  } from "react-router-dom";
// import { RouteProps } from "@types/react-router";
import TranposeSetter from "./TransposeSetter.jsx";
import ChrodLib from "../api/libchrod.js";
import { RmdHelpers } from "../api/collections.js";
import Collapsed from './Collapsed.jsx';

var Parser = require("html-react-parser");

interface ViewerProps {
  song: PropTypes.object.isRequired
  // Work around (somewhere there should be 
  // an existing interface to inherit from
  match: any
  history: any
}

export default class Viewer extends Component<ViewerProps, {}> {
  constructor(props: ViewerProps) {
    super(props);
    this.state = { relTranspose: 0 };
  }
  state: {relTranspose : number}

  handleContextMenu = event => {
    let m = this.props.match.params;
    this.props.history.push("/edit/" + m.author + "/" + m.title);
    event.preventDefault();
  };

  handleTransposeSetter = pitch => {
    this.setState({ relTranspose: pitch });
  };

  render() {
    let chords = this.props.song.getChords();
    let chrodlib = new ChrodLib();
    let rmd_html = this.props.song.getHtml();

    let key = ChrodLib.guessKey(chords);

    // TODO: if key undef, write something there

    let dT = this.state.relTranspose;

    // Parse HTML to react-vdom and replace chord values.
    let vdom = Parser(rmd_html, {
      replace: function(domNode) {
        if (domNode.name && domNode.name == 'i') {
          let chord = domNode.attribs['data-chord'];
          if (chord) {
            let chord_transposed_data = chrodlib.transpose(chord, key, dT);
            domNode.attribs["data-chord"]= chord_transposed_data;
          }
          // return <span className="chord">{c}</span>
          return domNode;
        }
      }
    });

    // Idee: obige replace-funktion könnte vom TransposeSetter geholt werden. Dadurch könnte der relTranspose-Zustand völlig in 
    // den TransposeSetter wandern. 

    /*
    if (this.state.relTranspose != 0) {
      chordtable = (
        <table className="chordtable">
          <tbody>
            <tr>
              <td>Orig:</td>
              {chords.map((c, i) => <td key={i}>{c}</td>)}
            </tr>
            <tr>
              <td>Tran:</td>
              {chrodlib
                .transpose(chords, this.state.relTranspose)
                .map((c, i) => <td key={i}>{c}</td>)}
            </tr>
          </tbody>
        </table>
      );
    } else {
      chordtable = "";
    }
    */


    return (
      <div className="container">
        <div
          className="content chordsheet"
          id="chordsheet"
          onContextMenu={this.handleContextMenu}
        >
          <section>
            <TranposeSetter
              doshit={this.handleTransposeSetter}
              intialTranspose={this.state.relTranspose}
              keym={key}
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
}

// export default withRouter(Viewer); // injects history, location, match