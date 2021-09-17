import * as React from 'react'
import  { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import Source from './Source.jsx';
import RevBrowser from './RevBrowser.jsx';
import Preview from './Preview';
import Drawer from './Drawer';
import { Ok, Cancel } from './Icons.jsx';
import { Song } from '../api/collections';
import { Requireable } from 'react';
import { Meteor } from 'meteor/meteor';


class Editor extends Component<{song: Song}, {md: string, versionTab: boolean, dirty: boolean}> {
  mdServer: string;
static propTypes:  {
  song: Requireable<Song>
};

  constructor(props) {
    super(props);
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

  update = (md_) => {
    this.setState({
      md: md_,
      dirty: md_ != this.mdServer
    });
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

    let prompt = <Prompt
            when={this.state.dirty && revs > 0}
            message={"Du hast noch ungespeicherte Änderungen. Verwerfen?"}
          />

    if (this.state.versionTab == false) {

      let versions = revs ? (
        <Drawer id="revs" className="revision-colors" onClick={this.toggleRevTab}>
          <h1>Verlauf</h1>
          <p>Es existieren {revs.length} Versionen. Klicke, um diese zu durchstöbern!</p>
        </Drawer>
      ) : undefined;

      let dirtyLabel = this.state.dirty ? <span id="dirty" title="Ungesicherte Änderungen"></span> : undefined;

      // Bearbeiten mit Echtzeit-Vorschau
      return (
        <div id="editor" onContextMenu={this.handleContextMenu}>
          <div className="extend mobilemenu" >
              <span onClick={this.handleContextMenu} id="plus"><Ok /></span>
              <span onClick={this.props.history.goBack} id="minus"><Cancel /></span>
          </div>

          <Drawer onClick={this.handleContextMenu} className="list-colors">
            <h1>sichern<br />&amp; zurück</h1>
            <p>Schneller: Rechtsklick!</p>
          </Drawer>

          {dirtyLabel}
          <Preview md={this.state.md} song={this.props.song} updateHandler={this.update}/>
          <Source md={this.state.md} updateHandler={this.update} className="source-colors" />

          {versions}
          {prompt}
        </div>
      );

    } else {
      // Versionen vergleichen
      return (
        <div id="editor" onContextMenu={this.handleContextMenu}>

          <Drawer className="chordsheet-colors" onClick={this.toggleRevTab}>
            <h1>zurück</h1>
            <p>…und weiterbearbeiten!</p>
          </Drawer>

          <Source md={this.state.md} updateHandler={this.update} className="source-colors">
            <span className="label">Version in Bearbeitung</span>
          </Source>
          <RevBrowser song={this.props.song} />
          {prompt}
        </div>
      );

    }
  }
}


export default withRouter(Editor);  // injects history, location, match