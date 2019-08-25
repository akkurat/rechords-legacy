import * as React from 'react';
import * as ReactDOM from 'react-dom'
import { withRouter, NavLink } from 'react-router-dom';
import TranposeSetter from './TransposeSetter.jsx';
import ChrodLib, { IScaleReference } from '../api/libchrod.js';
import Collapsed from './Collapsed';

import './Viewer.less'
import { Song } from '../api/collections.js';
import { History } from 'history';

import ReactHtmlParser from 'react-html-parser'
import { DomElement } from 'htmlparser2'
import { MobileHeader, MobileMenuButton } from './MobileMenu';
import { Swipeable, useSwipeable } from 'react-swipeable'

// import { findDOMNode } from 'react-dom';

export const highlightSwipe = ev => {
  // This feels wrong, altering the body property.
  // But stuff issn't really modular anyways
  const bodyContainer = document.getElementById('body');
  if (ev.event.type === 'touchend') {
    // view.style.marginLeft = '';
    // view.style.opacity = ''
    bodyContainer.style.left = '0px'

    return;
  }
  bodyContainer.style.left = -ev.deltaX + 20 + 'px'; // 20 is offset when swipe becomes active
}

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

  key: IScaleReference = undefined
  containerRef: React.RefObject<HTMLDivElement>
  settingPanel: React.RefObject<HTMLDivElement>;
  vrefs: { mobileTransposePanel: React.RefObject<HTMLDivElement>; };
  chrodlib: ChrodLib;
  keytrans: IScaleReference;

  constructor(props) {
    super(props);
    this.chrodlib = new ChrodLib();
    this.state = { relTranspose: 0, columns: undefined };
    // TODO: group those refs in vrefs, too
    this.containerRef = React.createRef();
    this.settingPanel = React.createRef();
    this.vrefs = {
      mobileTransposePanel: React.createRef(),
    };
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
    this.openEditView();
    event.preventDefault();
  };

  transposeSetter = pitch => {
    this.setState({ relTranspose: pitch });
  };

  transposePlus: React.MouseEventHandler = ev => {
    this.setState({ relTranspose: this.state.relTranspose + 1 })
  }
  transposeMinus = () => {
    this.setState({ relTranspose: this.state.relTranspose - 1 })
  }
  transposeReset = () => {
    this.setState({ relTranspose: 0 })
  }

  toggleTranspose: React.MouseEventHandler = ev => {
    ev.preventDefault()
    const el = this.vrefs.mobileTransposePanel.current;
    if (el.classList.contains('open')) {
      el.classList.remove('open')
    } else {
      el.classList.add('open')
    }
  }

  openEditView = () => {
    let m = this.props.match.params;
    this.props.history.push("/edit/" + m.author + "/" + m.title);
  }

  render() {
    // Parse HTML to react-vdom and replace chord values.
    const vdom = this.createVdom();

    const options = []
    for (let i = 1; i < 6; i++) {
      options.push(<option key={i + 'column'} value={i}>{i}</option>)
    }
    let edit, transpose, s = this.props.song;
    if (s) {
      edit = (<div className="mobileheader--edit"> <NavLink to={`/edit/${s.author_}/${s.title_}`} >
        <svg className="icon">
          <use href="/icons/001-edit.svg#Capa_1" />
        </svg>

      </NavLink> </div>)
    }
    let transposed = <></>
    if (this.state.relTranspose !== 0) {
      const pm = this.state.relTranspose > 0 ? '+' : ' '
      transposed = <span className="pitchIndicator">{pm}{this.state.relTranspose}</span>
    }
    if (s) {
      transpose = (
        <div className="mobileheader--transpose"> <a href="#" onClick={this.toggleTranspose}>
          <svg className="icon">
            <use href="/icons/004-settings.svg#Capa_1" />
          </svg>
          {transposed}
        </a>
        </div>
      )
    }
    // const swipers = useSwipeable({ onSwipedLeft: this.openEditView })



    return (
      <>
        <MobileHeader>
          {edit}
          <MobileMenuButton />
          {transpose}
        </MobileHeader>
        <div id="mobileTransposePanel" ref={this.vrefs.mobileTransposePanel}>
          <span onClick={this.transposePlus}>+</span>
          <span onClick={this.transposeReset}>{this.keytrans.key}</span>
          <span onClick={this.transposeMinus}>-</span>
        </div>
        <div id="inlineSettings" ref={this.settingPanel}>
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
          // {...swipers}
          className="content chordsheet"
          id="chordsheet"
          onContextMenu={this.handleContextMenu} >
          <Swipeable onSwiping={highlightSwipe}
            onSwiped={highlightSwipe}
            onSwipedLeft={this.openEditView} delta={20} className="contents">
            <section ref={this.containerRef} id="chordSheetContent">
              {vdom}
            </section>
          </Swipeable>
        </div>
        <Collapsed id="editSource" className="source" onClick={this.handleContextMenu} edge="right">
          <h1>bearbeiten</h1>
          <p>Schneller:&nbsp;Rechtsklick!</p>
        </Collapsed>
      </>
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
    const song = this.props.song
    const chords = song.getChords()
    const rmd_html = song.getHtml()
    const tags = song.getTags()

    let key = tags.get('key')
    this.key = ChrodLib.guessKey(chords, key);

    // TODO: if key undef, write something there
    const dT = this.state.relTranspose;
    this.keytrans = this.chrodlib.shift(this.key, dT)

    const trans = (domNode: DomElement, idx: number) => {
      if (domNode.name && domNode.name == 'i' && 'data-chord' in domNode.attribs) {
        const chord = domNode.attribs['data-chord'];
        const t = this.chrodlib.transpose(chord, this.key, dT);
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
    const out: Array<React.ReactElement<any>> = ReactHtmlParser(rmd_html, { transform: trans });
    return this.wrapH1H2Ul(out)
  }
  wrapH1H2Ul(inp: Array<React.ReactElement<any>>): Array<React.ReactElement<any>> {

    const miniState = { outElements: [], wrappees: [] }
    const wrappable = ['h1', 'h2', 'ul']
    for (const element of inp) {
      if (wrappable.indexOf(element.type as string) >= 0) {
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
