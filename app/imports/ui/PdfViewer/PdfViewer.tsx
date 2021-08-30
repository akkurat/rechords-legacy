import * as React from 'react'

import { IViewerProps } from '../Viewer'
import { PdfObject } from './PdfObject'
import { IPdfViewerSettings, PdfSettings, PdfViewerStates } from './PdfSettings'
import { jsPdfGenerator } from './PdfRenderer'
import { debounce } from 'underscore'
import Drawer from '../Drawer'
import { NavLink } from 'react-router-dom'
import './PdfViewer.less'
import classNames from 'classnames'
import { clef } from './SettingIcons'
import { PDF } from '../Icons.jsx'
import { useState } from 'react'

const debug = true

export class PdfViewer extends React.Component<IViewerProps, { pdfBlobUrl: string, loading: boolean }> {
  first: boolean
  constructor(props: IViewerProps) {
    super(props)
    this.state = { pdfBlobUrl: '', loading: true }
  }


    componentDidMount = () => {
      this.first = true;
    }

    generatePdf = async (settings: IPdfViewerSettings) => {
      const vdom = this.props.song.getHtml()
      const pdfBlobUrl = await jsPdfGenerator(vdom, settings)
      this.setState(
        os => {
          setTimeout(() => URL.revokeObjectURL(os.pdfBlobUrl), 10e3) // freeing old url for memory
          setTimeout(() => this.setState({loading: false}), 2e3 )
          return { pdfBlobUrl }
        }
      )
    }

    _setSettings = debounce((a: IPdfViewerSettings) => this.generatePdf(a), 500)

    setSettings = (settings: IPdfViewerSettings) =>  {
      if( this.first ) { this.first = false; this.generatePdf(settings)}
      else { this.setState({loading:true}); this._setSettings(settings) }
    }



    render() {
      // let pdfBlob = 



      const s = this.props.song


      return <>
        <Drawer open={true} id="pdfsettings">
          <NavLink to={`/view/${s.author_}/${s.title_}`} >x</NavLink>
          <PdfSettings consumer={this.setSettings} songId={this.props.song._id} />
        </Drawer>
        <div className={classNames({pdfgrid: true, loading: this.state.loading})} >
          <div className="loading"></div>
          <PdfSpinner />
          <PdfObject url={this.state.pdfBlobUrl}></PdfObject>
        </div>
      </>



    }





}



const icons = [<PDF />, clef]
const PdfSpinner: React.FunctionComponent<{}> = () => {

  const [idx, setIdx] = useState(0)

  const icon = icons[idx]

  const handleAnimationEnd = (ev) => {
    setIdx( (idx+1)%2 )
  }

  return <div className="spinner" 
  onAnimationIteration={handleAnimationEnd}> {icon} </div>
}

