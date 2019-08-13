import * as React from 'react';
import * as ReactDOM from 'react-dom'
import { withRouter } from "react-router-dom";
import TranposeSetter from "./TransposeSetter.jsx";
import ChrodLib from "../api/libchrod.js";
import Collapsed from './Collapsed.jsx';

import './Viewer.less'
import { Song } from '../api/collections.js';
import { History } from 'history';

import ReactHtmlParser from 'react-html-parser'
import { DomElement } from 'htmlparser2'

// import { findDOMNode } from 'react-dom';


// type Parser = (html: string, options?: ParserOptions) => ReactNode[]
interface IViewerState {
  columns: number
  relTranspose: number
}
interface IViewerProps {
  history: History
  match: any
  song: Song
}

class Viewer extends React.Component<IViewerProps, IViewerState> {

  key = undefined
  containerRef = undefined

  constructor(props) {
    super(props);
    this.state = { relTranspose: 0, columns: undefined };
    this.containerRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.song == prevProps.song) return;

    // Song has changed.
    const node = ReactDOM.findDOMNode(this);
    const element = node as Element
    element.children[0].scrollTop = 0;
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
    const vdom = this.createVdom();

    const options = []
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
          {this.containsLyrics() &&
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
        <Collapsed id="editSource" className="source hide-s" onClick={this.handleContextMenu}>
          <div className="source">
            <h1>bearbeiten</h1>
            <p>Schneller:&nbsp;Rechtsklick!</p>
          </div>
        </Collapsed>
      </div>
    );
  }

  handleColDropdown = (ev) => {
    const cols = ev.target.value
    const element = this.containerRef.current
    if (cols == 'auto') {
      element.style['column-count'] = '';
    } else {
      element.style['column-count'] = ev.target.value;
    }

  }

  containsLyrics() {
    const chords = this.props.song.getChords()
    return chords && chords.length > 0
  }

  createVdom() {
    const chrodlib = new ChrodLib();
    const chords = this.props.song.getChords();
    const rmd_html = this.props.song.getHtml();

    this.key = ChrodLib.guessKey(chords);
    const key = this.key;


    // TODO: if key undef, write something there
    const dT = this.state.relTranspose;
    const trans = (domNode: DomElement, idx: number) => {
      if (domNode.name && domNode.name == 'i' && 'data-chord' in domNode.attribs) {
        const chord = domNode.attribs['data-chord'];
        const t = chrodlib.transpose(chord, key, dT);
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
    const out: React.ReactElement<any>[] = ReactHtmlParser(rmd_html, { transform: trans });
    return this.wrapH1H2Ul(out)
  }
  wrapH1H2Ul(inp: React.ReactElement<any>[]): React.ReactElement<any>[] {

    const miniState = { outElements: [], wrappees: [] }
    const wrappable = ['h1', 'h2', 'ul']
    for (const element of inp) {
      if (wrappable.indexOf(element.type as string) >= 0){
          miniState.wrappees.push(element)
      } else {
        this.wrap(miniState)
        miniState.outElements.push(element)
      }
    }
    this.wrap(miniState)
    return miniState.outElements
  }

  private wrap(s: { outElements: any[]; wrappees: any[]; }) {
    if (s.wrappees.length > 0) {
      s.outElements.push(<div className="span-wrapper"> {s.wrappees} </div>);
      s.wrappees = []
    }
  }
}

export default withRouter(Viewer); // injects history, location, match


