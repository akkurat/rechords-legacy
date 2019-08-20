import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Songs, { Revisions } from '../api/collections.js';
import { withRouter, Prompt, NavLink } from 'react-router-dom';
import Collapsed from './Collapsed.tsx';
import Source from './Source.tsx';
import RevBrowser from './RevBrowser.jsx';
import Preview from './Preview.tsx';
import { MobileHeader, MobileMenuButton } from './MobileMenu';


class Editor extends Component {

  constructor(props) {
    super();
    this.state = {
      md: props.song.text,
      versionTab: false,
      dirty: false
    };

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

    let viewlink, revisions, s=this.props.song;
    if (s) { viewlink = <div className="mobileheader--edit"> <NavLink to={`/view/${s.author_}/${s.title_}`} >Back</NavLink> </div> }
    if (s) { revisions = <div className="mobileheader--transpose"> <a href="#">Revisions</a> </div> }

      // Bearbeiten mit Echtzeit-Vorschau
      return (
      <>
        <div className="show-s">
            <MobileHeader>
              {viewlink}
              {revisions}
              <MobileMenuButton />
            </MobileHeader>
        </div>
        <div id="editor" onContextMenu={this.handleContextMenu}>

          <Collapsed id="list" onClick={this.handleContextMenu} className="chordsheet " edge="left">
            <h1>sichern<br />&amp; zurück</h1>
            <p>Schneller: Rechtsklick!</p>
          </Collapsed>

          {dirtyLabel}
          <Preview md={this.state.md} song={this.props.song} updateHandler={this.update} lastLineEdit={this.state.lastLineEdit}/>
          <Source md={this.state.md} updateHandler={this.update} className="source" />

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