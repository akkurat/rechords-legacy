import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import Songs, { Revisions } from '../api/collections.js';
import { withRouter, Prompt, NavLink } from 'react-router-dom';
import Collapsed from './Collapsed.tsx';
import Source from './Source.tsx';
import RevBrowser from './RevBrowser.jsx';
import Preview from './Preview.tsx';
import { MobileHeader } from './MobileMenu';
import { MouseEventHandler } from 'react'
import Split from 'react-split'

const splitModes = [
  { source: 'large', preview: 'small' },
  { source: 'small', preview: 'large' },
  { source: 'none', preview: 'all' },
  { source: 'all', preview: 'none' },
]
const splitOrders = [
  { source: 'first', preview: 'second' },
  { source: 'second', preview: 'first' },
]


class Editor extends Component {

  constructor(props) {
    super();
    this.state = {
      md: props.song.text,
      versionTab: false,
      dirty: false,
      splitmode: 0,
      splitorder: 0,
      center: 50,
    };
    this.vrefs = {editorpane: createRef()};

    this.mdServer = props.song.text;
  }

  handleContextMenu = (event) => {
    if (this.state.versionTab) {
      this.toggleRevTab();
      event.preventDefault();
      return;
    }

    this.props.song.parse(this.state.md)

    Meteor.call('saveSong', this.props.song, (error, isValid) => {
      if (error !== undefined) {
        console.log(error);
      } else {
        this.setState({
          dirty: false,
        });
      }

      if (isValid) {
        this.props.history.push('/view/' + this.props.song.author_ + '/' + this.props.song.title_);
      } else {
        this.props.history.push('/');
      }
    });

    event.preventDefault();
  }

  update = (md_, pos) => {
    this.setState({
      md: md_,
      dirty: md_ != this.mdServer
    });
    if (pos) {
      const matches = (md_.substring(0, pos).match(/\n=*\s*/g) || '');
      const lineNumber = matches.length
      this.setState({
        lastLineEdit: lineNumber
      })
    }
  }

  toggleRevTab = () => {
    this.setState((prevState, props) => {
      return {
        versionTab: !prevState.versionTab
      }
    });
  }

  handleSetViewToggle = (ev) => {
    this.state.splitmode = (this.state.splitmode + 1) % splitModes.length
  }
  handleSetViewOrder = (ev) => {
    this.state.splitorder = (this.state.splitorder + 1) % splitOrders.length
  }
  handleDrag = (ev) => {
    if(ev.type==='dragstart') {
      this.dragx = ev.pageX;
    }
    if(ev.type ==='dragend') {
      const deltaX = this.dragx - ev.pageX;
      const pane = this.vrefs.editorpane.current
      const target = ev.target
      const relX = ev.clientX-pane.clientLeft
      const rel = relX/pane.clientWidth

      this.setState({center: rel*100})
    }

  }

  render() {

    let revs = this.props.song.getRevisions();
    let n = revs.count();

    let prompt = <Prompt
      when={this.state.dirty && n > 0}
      message={"Du hast noch ungespeicherte Änderungen. Verwerfen?"}
    />

    if (this.state.versionTab == false) {

      let versions = n == 0 ? undefined : (
        <Collapsed id="revs" className="revision hide-s" onClick={this.toggleRevTab} edge="right">
          <h1>Verlauf</h1>
          <p>Es existieren {n} vorherige Versionen. Klicke, um diese zu durchstöbern!</p>
        </Collapsed>
      );

      let dirtyLabel = this.state.dirty ? <span id="dirty" title="Ungesicherte Änderungen"></span> : undefined;

      let viewlink, revisions, splitmode, s = this.props.song;
      // TODO: this component should fail in the constructor without song present
      if (s) { viewlink = <div> <NavLink to={`/view/${s.author_}/${s.title_}`} >Back</NavLink> </div> }
      if (s) {
        splitmode = <div>
          <a href="#" onClick={this.handleSetViewToggle}>Splitmode</a>
          <a href="#" onClick={this.handleSetViewOrder}>Order</a>
        </div>
      }
      if (s) { revisions = <div> <a href="#">Revisions</a> </div> }

      // TODO: this could be a function
      const split = splitModes[this.state.splitmode]
      const order = splitOrders[this.state.splitorder]

      // Bearbeiten mit Echtzeit-Vorschau
      return (
        <>
          <MobileHeader>
            {viewlink}
            {splitmode}
            {revisions}
          </MobileHeader>

          <Collapsed onClick={this.handleContextMenu} className="chordsheet hide-s" edge="left">
            <h1>sichern<br />&amp; zurück</h1>
            <p>Schneller: Rechtsklick!</p>
          </Collapsed>
          <div id="editor" onContextMenu={this.handleContextMenu} ref={this.vrefs.editorpane}>
            {dirtyLabel}
              <Preview md={this.state.md} song={this.props.song} className={split.preview + ' ' + order.preview}
                updateHandler={this.update} lastLineEdit={this.state.lastLineEdit}
                style={{width: this.state.center+'%'}} />
              <div style={{width: '15px'}} 
              onDragStart={this.handleDrag} 
              onDragEnd={this.handleDrag} 
              draggable="true" className="hide-s"/>
              <Source md={this.state.md} updateHandler={this.update} 
                      className={'source ' + split.source + ' ' + order.source} 
                      style={{ width: (100-this.state.center) + '%' }} />
                      
            {versions}
            {prompt}
          </div>
        </>
      );

    } else {
      // Versionen vergleichen
      return (
        <div id="editor" onContextMenu={this.handleContextMenu}>

          <Collapsed className="chordsheet" onClick={this.toggleRevTab}>
            <h1>zurück</h1>
            <p>…und weiterbearbeiten!</p>

          </Collapsed>

          <Source md={this.state.md} updateHandler={this.update} className="source">
            <span className="label">Version in Bearbeitung</span>
          </Source>
          <RevBrowser song={this.props.song} />
          {prompt}
        </div>
      );

    }
  }
}

Editor.propTypes = {
  song: PropTypes.object.isRequired,
};

export default withRouter(Editor);  // injects history, location, match