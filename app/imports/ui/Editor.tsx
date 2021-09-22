import * as React from 'react'
import  { Component } from 'react'
import { withRouter, Prompt } from 'react-router-dom'
import Source from './Source'
import RevBrowser from './RevBrowser.jsx'
import Preview from './Preview'
import Drawer from './Drawer'
import { Ok, Cancel, Eye, Md } from './Icons.jsx'
import { Song } from '../api/collections'
import { Requireable } from 'react'
import { Meteor } from 'meteor/meteor'
import { MobileMenuShallow } from './MobileMenu'
import classNames from 'classnames'
import { IsOptional, OptionalKeys } from 'prop-types'


interface EditorState extends EditorToggles{
  md: string;
}
interface EditorToggles {
  versionTab: boolean;
  dirty: boolean;
  preview: boolean;
  mdview: boolean;
}

class Editor extends Component<{song: Song}, EditorState> {
  mdServer: string;
static propTypes:  {
  song: Requireable<Song>,
};

constructor(props) {
  super(props)
  this.state = {
    md: props.song.text,
    versionTab: false,
    dirty: false,
    preview: false,
    mdview: true
  }

  this.mdServer = props.song.text
}

  handleContextMenu = (event) => {
    if (this.state.versionTab) {
      this.toggleRevTab()
      event.preventDefault()
      return
    }

    this.props.song.parse(this.state.md)

    Meteor.call('saveSong', this.props.song, (error, isValid) => {
      if (error !== undefined) {
        console.log(error)
      } else {
        this.setState({
          dirty: false,
        })
      }

      if (isValid) {
        this.props.history.push('/view/' + this.props.song.author_ + '/' + this.props.song.title_)
      } else {
        this.props.history.push('/')
      }
    })

    event.preventDefault()
  }

  update = (md_) => {
    this.setState({
      md: md_,
      dirty: md_ != this.mdServer
    })
  }

  toggleState(p: keyof EditorToggles) {
    return () => this.setState( prevState => ({[p]: !prevState[p]}) )
  }

  toggleRevTab() { this.toggleState('versionTab')}

  render() {

    const revs = this.props.song.getRevisions()

    const prompt = <Prompt
      when={this.state.dirty && revs > 0}
      message={'Du hast noch ungespeicherte Änderungen. Verwerfen?'}
    />

    if (this.state.versionTab == false) {

      const versions = revs ? (
        <Drawer id="revs" className="revision-colors" onClick={this.toggleRevTab}>
          <h1>Verlauf</h1>
          <p>Es existieren {revs.length} Versionen. Klicke, um diese zu durchstöbern!</p>
        </Drawer>
      ) : undefined

      const dirtyLabel = this.state.dirty ? <span id="dirty" title="Ungesicherte Änderungen"></span> : undefined


      const toggleProp = (prop: keyof Ed) => this.setState( p => ({[prop]: ![prop].preview}))

      // Bearbeiten mit Echtzeit-Vorschau
      return (
        <div id="editor" onContextMenu={this.handleContextMenu}>
          <MobileMenuShallow>
            <span onClick={this.handleContextMenu} ><Ok /></span>
            <span onClick={this.props.history.goBack} ><Cancel /></span>
            <span 
              className={classNames({active: this.state.preview})} 
              onClick={this.toggleState('preview')} ><Eye /></span>
            <span 
              className={classNames({active: this.state.mdview})}
              onClick={this.toggleState('mdview')}><Md /></span>
          </MobileMenuShallow>

          <Drawer onClick={this.handleContextMenu} className="list-colors">
            <h1>sichern<br />&amp; zurück</h1>
            <p>Schneller: Rechtsklick!</p>
          </Drawer>

          {dirtyLabel}
          {/* Using CSS to hide views obvliates the need for media query in React */}
          <Preview classNames={classNames({hideInMobile: !this.state.preview, miniPreview: this.state.mdview})} md={this.state.md} song={this.props.song} updateHandler={this.update}/>
          <Source md={this.state.md} updateHandler={this.update} 
            className={classNames('source-colors', {hideInMobile: !this.state.mdview})} />

          {versions}
          {prompt}
        </div>
      )

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
      )

    }
  }
}


export default withRouter(Editor)  // injects history, location, match