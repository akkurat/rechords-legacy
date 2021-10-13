import * as React from "react";
import { NavLink, RouteComponentProps } from "react-router-dom";
import TranposeSetter from "./TransposeSetter.jsx";
import ChrodLib from "../api/libchrod";
import { Song } from '../api/collections';
import Drawer from './Drawer';
import { MobileMenuShallow } from "./MobileMenu";
import {userMayWrite} from '../api/helpers';
import Sheet from './Sheet';

import { LayoutH, LayoutV, Day, Night, Sharp, Flat, Conveyor } from './Icons.jsx';


interface SongRouteParams {
  author: string
  title: string
}
interface ViewerProps extends RouteComponentProps<SongRouteParams> {
  song: Song,
  toggleTheme: React.MouseEventHandler<HTMLDivElement>,
  themeDark: boolean
}

interface ViewerStates {
  relTranspose: number,
  inlineReferences: boolean,
  showChords: boolean,
  columns: boolean,
  autoscroll: any
}

export default class Viewer extends React.Component<RouteComponentProps & ViewerProps, ViewerStates> {
  constructor(props) {
    super(props);

    this.state = {
      relTranspose: this.getInitialTranspose(),
      inlineReferences: false,
      showChords: true,
      columns: false,
      autoscroll: undefined
    };

  }

  refChordsheet = React.createRef<HTMLDivElement>()
  duration_s = undefined;

  componentDidUpdate(prevProps) {
    if (this.props.song._id == prevProps.song._id) return;

    // Song has changed.
    this.refChordsheet.current?.scrollTo(0, 0)
    this.setState({
      relTranspose: this.getInitialTranspose(),
    });
    this.setAutoScroll(false);

    let duration : string | true = this.props.song.checkTag('duration');
    if ( typeof duration === 'string') {
      let minutes, secs;
      [minutes, secs] = duration.split(':');
      this.duration_s = minutes*60 + secs;
    }
  }

  componentWillUnmount() {
    this.setAutoScroll(false);
  }

  getInitialTranspose() {
    for (let tag of this.props.song.getTags()) {
      if (!tag.startsWith('transponierung:')) continue;
      let dT = parseInt(tag.split(':')[1], 10);
      return isNaN(dT) ? 0 : dT;
    }
    return 0;
  }

  handleContextMenu: React.MouseEventHandler<HTMLElement> = event => {
    if (userMayWrite()) {
      let m = this.props.match.params;
      this.props.history.push("/edit/" + m.author + "/" + m.title);
    }
    event.preventDefault();
  };

  transposeSetter = pitch => {
    this.setState({ relTranspose: pitch });
  };

  increaseTranspose = () => {
    this.setState(function (state, props) {
      return { relTranspose: state.relTranspose + 1 }
    })
  };

  decreaseTranspose = () => {
    this.setState(function (state, props) {
      return { relTranspose: state.relTranspose - 1 }
    })
  };

  toggleAutoScroll = () => {
    this.setAutoScroll( this.state.autoscroll == undefined );
  }

  setAutoScroll = (target_state) => {
    const callback = () => {
      this.refChordsheet.current?.scrollBy(0, 1);
    }

    this.setState( state => {
        if (state.autoscroll == undefined && target_state == true) {
          return { autoscroll: Meteor.setInterval(callback, 133) };
        }

        if (state.autoscroll != undefined && target_state == false) {
          Meteor.clearInterval(state.autoscroll);
          return { autoscroll: undefined };
        }
    });

  }

  toggleChords = () => {
    this.setState( state => ({ showChords: !state.showChords }));
  };

  toggleColumns = () => {
    this.setState( state => ({ columns: !state.columns }));
  };

  toggleInlineReferences = () => {
    this.setState(state => ({ inlineReferences: !state.inlineReferences }))
  };

  render() {

    // Establish this songs' key
    let key_tag = this.props.song.checkTag("tonart");
    let key = typeof key_tag === 'string' && ChrodLib.parseTag(key_tag);

    if (!key) {
      key = ChrodLib.guessKey(this.props.song.getChords());
    }

    const settings = <aside id="rightSettings">
        { this.state.showChords ? <TranposeSetter
              onDoubleClick={this.toggleChords}
              transposeSetter={this.transposeSetter}
              transpose={this.state.relTranspose}
              keym={key} id="transposer"
            />
        :
          <div onClick={this.toggleChords} className="rightSettingsButton"><span>Chords</span></div>
        }
        <div onClick={this.toggleAutoScroll} id={'scroll-toggler'} className={this.state.autoscroll ? 'active' : ''}>
          <Conveyor />
        </div>
        <div onClick={this.props.toggleTheme} id={'theme-toggler'} >
          {this.props.themeDark ? <Day /> : <Night />}
        </div>
        <div onClick={this.toggleColumns} id={'layout-toggler'} >
          {this.state.columns ? <LayoutH /> : <LayoutV />}
        </div>
      </aside>
    

    const drawer = userMayWrite() ? (
        <Drawer className="source-colors" onClick={this.handleContextMenu}>
          <h1>bearbeiten</h1>
          <p>Schneller:&nbsp;Rechtsklick!</p>
        </Drawer>
    ) : undefined;

    const s = this.props.song;
    const footer = userMayWrite() ? (
        <div className="mobile-footer"><NavLink to={`/edit/${s.author_}/${s.title_}`} id="edit">Bearbeiten…</NavLink></div>
    ) : undefined;

    return (

      <>
        <MobileMenuShallow>
            <span onClick={ _ => this.increaseTranspose()} id="plus"><Sharp /></span>
            <span onClick={ _ => this.decreaseTranspose()} id="minus"><Flat /></span>
            <span onClick={this.toggleAutoScroll} id={'scroll-toggler'} className={this.state.autoscroll ? 'active' : ''}>
              <Conveyor />
            </span>
            <span onClick={this.props.toggleTheme} id="theme-toggler">
              {this.props.themeDark ? <Day /> : <Night />}
            </span>
        </MobileMenuShallow>

        <div
          className={'content' + (this.showMultiColumns() ? ' multicolumns':'')}
          id="chordsheet" ref={this.refChordsheet}
          onContextMenu={this.handleContextMenu}
        >
          <Sheet 
          
          multicolumns={this.showMultiColumns()}
          song={this.props.song} 
          transpose={this.state.relTranspose} 
          hideChords={!this.state.showChords} />
          {footer}
        </div>
        {settings}
        {drawer}
      </>
    );
  }

  private showMultiColumns() {
    return this.state.columns;
  }
}

