import  { Component } from 'react';
import * as React from 'react';
import Songs, { Revisions } from '../api/collections';
import { withRouter } from 'react-router-dom';
import Collapsed from './Collapsed';
import Source from './Source';
import Preview from './Preview';
import moment from 'moment';

interface EditorState {
  md: string,
  versionTab: boolean,
}
class Editor extends Component<EditorProps, EditorState> {

  constructor(props) {
    super(props);
    this.state = {
      md: props.song.text,
      versionTab: false
    };
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
      md: md_
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
    let n = revs.count();

    if (this.state.versionTab == false) {

      let versions = n == 0 ? undefined : (
        <Collapsed id="revs" className="revision" onClick={this.toggleRevTab}>
          <h1>Verlauf</h1>
          <p>Es existieren {n} vorherige Versionen. Klicke, um diese zu durchstöbern!</p>
        </Collapsed>
      );

      // Bearbeiten mit Echtzeit-Vorschau
      return (
        <div id="editor" onContextMenu={this.handleContextMenu}>

          <Collapsed id="list" onClick={this.handleContextMenu}>
            <h1>sichern<br />&amp; zurück</h1>
            <p>Schneller: Rechtsklick!</p>
          </Collapsed>

          <Preview md={this.state.md} song={this.props.song} updateHandler={this.update}/>
          <Source md={this.state.md} updateHandler={this.update} className="source" />

          {versions}
        </div>
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
        </div>
      );

    }
  }
}

interface EditorProps {
  song: any,
  // Workaround for now...
  history: any,
  match: any
};

export default withRouter(Editor);  // injects history, location, match