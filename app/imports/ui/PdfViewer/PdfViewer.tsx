import * as React from 'react'

import { IViewerProps } from '../Viewer'
import { PdfObject } from './PdfObject'
import { IPdfViewerSettings, PdfSettings } from './PdfSettings'
import { jsPdfGenerator } from './PdfRenderer'
import { debounce } from 'underscore'
import Drawer from '../Drawer'
import { NavLink } from 'react-router-dom'
import './PdfViewer.less'
import classNames from 'classnames'
import { PDF, Clef } from '../Icons'
import { useState } from 'react'

const debug = true

export class PdfViewer extends React.Component<IViewerProps, { loading: boolean, urls:string[] }> {
  first: boolean
  constructor(props: IViewerProps) {
    super(props)
    this.state = { loading: true, urls:[] }
  }


    componentDidMount = () => {
      this.first = true;
    }

    generatePdf = async (settings: IPdfViewerSettings) => {
      const vdom = this.props.song.getHtml()
      const pdfBlobUrl = await jsPdfGenerator(vdom, settings)
      this.setState( s => {s.urls.push(pdfBlobUrl); console.log(s.urls); return {urls:s.urls}})
      console.log('pushed')
      
      setTimeout(() => {
        if( this.state.urls.length > 1 ) {
        const url = this.state.urls.shift();
         URL.revokeObjectURL(url)// freeing old url from memory
        }
      this.setState( { loading:false } )
      }
         , 2e3) 
      
    }

    _setSettings = debounce((a: IPdfViewerSettings) => this.generatePdf(a), 500)

    setSettings = (settings: IPdfViewerSettings) =>  {
      if( this.first ) { this.first = false; this.generatePdf(settings)}
      else { this.setState({loading:true}); this._setSettings(settings) }
    }



    render() {
      // let pdfBlob = 


      console.log('render')

      const s = this.props.song


      return <>
        <Drawer open={true} id="pdfsettings">
          <NavLink to={`/view/${s.author_}/${s.title_}`} >x</NavLink>
          <PdfSettings consumer={this.setSettings} songId={this.props.song._id} />
        </Drawer>
        <div className={classNames({pdfgrid: true, loading: this.state.loading})} >
          {this.state.urls.map( u => <PdfObject key={u} url={u}></PdfObject> )}
          <PdfSpinner />
        </div>
      </>



    }





}



const icons = [<PDF />, <Clef />]
const PdfSpinner: React.FunctionComponent<{}> = () => {

  const [idx, setIdx] = useState(0)

  const icon = icons[idx]

  const handleAnimationEnd = (ev) => {
    setIdx( (idx+1)%2 )
  }

  return <div className="spinner" 
  onAnimationIteration={handleAnimationEnd}> {icon} </div>
}

