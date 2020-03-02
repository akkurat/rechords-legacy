import * as React from "react";
import {  NavLink, RouteComponentProps } from "react-router-dom";
import TranposeSetter from "./TransposeSetter.jsx";
import ChrodLib from "../api/libchrod";
import { Song } from '../api/collections';
import Drawer from './Drawer';
import { SizeContext } from './App.jsx'

var Parser = require("html-react-parser");

interface ViewerProps extends RouteComponentProps {
  song: Song,
  songs: Array<Song>
  updateTransposeInfo: Function
}

interface ViewerStates {
  relTranspose: number,
  menuOpen: boolean,
  viewPortGtM: boolean,
  inlineReferences: boolean,
  columnWidth: number
}

// Only expose necessary handler for transpose setting, not complete component
export interface ITransposeHandler {
  increaseTranspose: Function
  decreaseTranspose: Function 
}


export default class Viewer extends React.Component<RouteComponentProps & ViewerProps, ViewerStates> implements
ITransposeHandler {
  constructor(props) {
    super(props);
    this.state = {
      relTranspose: this.getInitialTranspose(),
      menuOpen: false,
      viewPortGtM: window.innerWidth > 900,
      inlineReferences: true,
      columnWidth: 15
    };
  }

  renderedKey : { key: string, scale: string} 

  getRelTranspose = () => this.state.relTranspose
  
  componentDidUpdate(prevProps, prevState) {

    // check for change, otherwise there will be an endless update loop
    if(prevState.relTranspose != this.state.relTranspose)
      this.props.updateTransposeInfo({ relTranspose: this.state.relTranspose, key: this.renderedKey })
    


    if (this.props.song._id == prevProps.song._id) return;

    // Song has changed.
    window.scrollTo(0, 0)
    this.setState({
      relTranspose: this.getInitialTranspose(),
      menuOpen: false
    });
  }

  getInitialTranspose() {
    for (let tag of this.props.song.getTags()) {
      if (!tag.startsWith('transponierung:')) continue;
      let dT = parseInt(tag.split(':')[1], 10);
      return isNaN(dT) ? 0 : dT;
    }
    return 0;
  }




  handleContextMenu = event => {
    let m = this.props.match.params;
    this.props.history.push("/edit/" + m.author + "/" + m.title);
    event.preventDefault();
  };

  transposeSetter = pitch => {
    const val = { relTranspose: pitch }
    this.setState(val);
  };

  increaseTranspose = () => {
    this.setState(function (state, props) {
      const val = { relTranspose: state.relTranspose + 1 }
      return val 
    })
  };

  decreaseTranspose = () => {
    this.setState(function (state, props) {
      const val = { relTranspose: state.relTranspose - 1 }
      return val 
    })
  };

  toggleMenu = () => {
    this.setState(function (state, props) {
      return { menuOpen: !state.menuOpen }
    })
  };

  toggleInlineReferences = () => {
    this.setState(state => ({ inlineReferences: !state.inlineReferences }))
  };

  changeColumnWidth = (ev) => {
    this.setState({columnWidth: ev.target.value})
  }

  render() {
    // Write rel tranpose only if was rendered 

    let chords = this.props.song.getChords();
    let chrodlib = new ChrodLib();
    let rmd_html = this.props.song.getHtml();

    let key = ChrodLib.guessKey(chords);

    this.renderedKey = key
    // TODO: if key undef, write something there

    let dT = this.state.relTranspose;

    // Parse HTML to react-vdom and replace chord values.
    let vdom = Parser(rmd_html, {
      replace: function (domNode) {
        if (domNode.name && domNode.name == 'i' && 'data-chord' in domNode.attribs) {
          let chord = domNode.attribs['data-chord'];
          let t = chrodlib.transpose(chord, key, dT);
          let chord_;
          if (t == null) {
            chord_ = <span className="before">{chord}</span>;
          } else {
            chord_ = <span className={"before " + t.className}>{t.base}<sup>{t.suff}</sup></span>;
          }
          return <i>{chord_}{domNode.children[0].data}</i>;
        }

        // if(domNode.attribs && 'class' in domNode.attribs) {
        //    let clazz = domNode.attribs['class']
        //    if(clazz == 'ref')
        //    {

        //    }
        // }
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
    const s = this.props.song;

    let open;
    if (this.state.viewPortGtM) {
      open = true;
    }
    else {
      open = this.state.menuOpen;
    }

    this.enrichReferences(vdom);

    const style = <style dangerouslySetInnerHTML={ {__html: 
      `#chordSheetContent >*:not(section), #chordSheetContent >section>* {
    width: ${this.state.columnWidth}rem;
    `

    }}></style>;

    return (

      <>
        <SizeContext.Consumer>
          {(info) => info.widthClass == 'desktop' ? <>{style}</> : <></>}
        </SizeContext.Consumer>
        <div
          className="content"
          id="chordsheet"
          onContextMenu={this.handleContextMenu}
        >
          <TranposeSetter
            transposeSetter={this.transposeSetter}
            transpose={this.state.relTranspose}
            keym={this.renderedKey}
          />
          <input type="number" value={this.state.columnWidth} onChange={this.changeColumnWidth} /> rem
          <section ref="html" id="chordSheetContent">
            <Bla />
            {vdom}
            
                                {/* <SizeContext.Consumer unstable_observedBits={0b001}>
                                    {any => <div>{any.desktop}</div>}
                                </SizeContext.Consumer> */}
          <div><NavLink className="content-footer" to={`/edit/${s.author_}/${s.title_}`}>Edit</NavLink></div>
          </section>
        </div>
        <Drawer className="source-colors hide-m" onClick={this.handleContextMenu}>
          <h1>bearbeiten</h1>
          <p>Schneller:&nbsp;Rechtsklick!</p>
        </Drawer>
      </>
    );
  }

  private enrichReferences(vdom: any) {
    let referencee = new Map<String, any>();
    for (let elem of vdom) {
      if (elem.props) {
        let id = elem.props.id;
        if (id && id.startsWith('sd-ref')) {
          referencee.set(id, elem);
        }
      }
    }
    for (let i = 0; i < vdom.length; i++) {
      let elem = vdom[i];
      if (elem.props) {
        let className = elem.props.className;
        if (className == 'ref') {
          elem = vdom[i] = React.cloneElement(elem,
            {
              'onClick': this.toggleInlineReferences,
            });
          let visible = this.state.inlineReferences ? ' shown' : ' hidden'
          const refName = elem.props.children;
          if( typeof refName != 'string')
            continue

          let ref = 'sd-ref-' + refName.trim();
          let defintion = referencee.get(ref)
          if( !defintion ) {
              defintion = <p>Referenz <em>{refName}</em> existiert nicht</p>
          }
          vdom.splice(i + 1, 0,
            React.cloneElement(defintion,
              { id: null, className: 'inlineReference' + visible })
          );
        }
      }
    }
  }
}


    const Bla : React.FunctionComponent  = (props) => {
            const sizeContext = React.useContext(SizeContext, 0b001)
            return <div>{JSON.stringify(sizeContext)}</div>
    }