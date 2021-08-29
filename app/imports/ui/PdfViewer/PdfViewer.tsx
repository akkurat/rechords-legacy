import * as React from 'react'

import { IViewerProps } from '../Viewer'
import { PdfBlob } from './PdfBlob'
import { IPdfViewerSettings, PdfSettings, PdfViewerStates } from './PdfSettings'
import { jsPdfGenerator } from './PdfRenderer'
import { debounce } from 'underscore'
import Drawer from '../Drawer'
import { NavLink } from 'react-router-dom'
import './PdfViewer.less'
import { search } from 'core-js/fn/symbol'

const debug = true

export class PdfViewer extends React.Component<IViewerProps, { pdfBlobUrl: string }> {
  first: boolean
  constructor(props: IViewerProps) {
    super(props)
    this.state = { pdfBlobUrl: '' }
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
          return { pdfBlobUrl }
        }
      )
    }

    _setSettings = debounce((a: IPdfViewerSettings) => this.generatePdf(a), 1500)

    setSettings = (settings: IPdfViewerSettings) =>  {
      if( this.first ) { this.first = false; this.generatePdf(settings)}
      else { this._setSettings(settings) }
    }



    render() {
      // let pdfBlob = 



      const s = this.props.song

      return <>
        <Drawer open={true} id="pdfsettings">
          <NavLink to={`/view/${s.author_}/${s.title_}`} >x</NavLink>
          <PdfSettings consumer={this.setSettings} songId={this.props.song._id} />
        </Drawer>
        <div className="content">
          <PdfBlob url={this.state.pdfBlobUrl}></PdfBlob>
        </div>
      </>



    }





}




