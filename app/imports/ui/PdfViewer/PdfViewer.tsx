import * as React from 'react'

import { IViewerProps } from '../Viewer'
import { PdfBlob } from './PdfBlob'
import { IPdfViewerSettings, PdfSettings, PdfViewerStates } from './PdfSettings'
import { jsPdfGenerator } from './PdfRenderer'
import { debounce } from 'underscore'
import Drawer from '../Drawer'
import { NavLink } from 'react-router-dom'
import './PdfViewer.less'

const debug = true

export class PdfViewer extends React.Component<IViewerProps, { pdfBlobUrl: string }> {
  constructor(props: IViewerProps) {
    super(props)
    this.state = { pdfBlobUrl: '' }
  }


    componentDidMount = () => {
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

    setSettings = debounce((a: IPdfViewerSettings) => this.generatePdf(a), 500)



    render() {
      // let pdfBlob = 



      const s = this.props.song

      return <>
        <Drawer open={true} id="pdfsettings" className="revision-colors" >
          <NavLink to={`/view/${s.author_}/${s.title_}`} >Back to Viewer</NavLink>
          <PdfSettings consumer={this.setSettings} songId={this.props.song._id} />
        </Drawer>
        <div className="content">
          <PdfBlob url={this.state.pdfBlobUrl}></PdfBlob>
        </div>
      </>



    }





}




