import * as React from 'react'

import { IViewerProps } from './Viewer'

import * as jsPDF from 'jspdf'

interface IPdfViewerStates  {
    pdfData: ArrayBuffer
}


export class PdfViewer extends React.Component<IViewerProps,IPdfViewerStates> {
    constructor(props: IViewerProps) {
        super(props)
        this.state = {pdfData: undefined}
    }

    pdfDoc : jsPDF

    componentWillReceiveProps(newProps: IViewerProps){
        if(this.props.song != newProps )
        {
            this.jsPdfGenerator( newProps.song?.getHtml())
        }

    }
    componentDidMount(){
        this.jsPdfGenerator(this.props.song?.getHtml())

    }

    


    jsPdfGenerator = (vdom) => {

        if(! vdom )
            return;

        // TODO from here:
        // Interchangeable PDF creator: input html string, output is bytearray


        // browserParser, not react parser. has bit more functions like 
        // selectors...
        const mdHtml = new DOMParser().parseFromString( vdom, "text/html");

        const header = mdHtml.querySelector('.sd-header')

        const sections = mdHtml.querySelectorAll('section')



        var doc = new jsPDF('l', 'mm', 'a4' )
        
        doc.setFont('helvetica').setFontType('bold').setFontSize(30);

        const start_x=30, start_y = 20;
        let last_y = start_y, last_x = start_x;

        doc.text(last_x, last_y, header?.textContent)
        const dims = doc.getTextDimensions(header?.textContent)
        last_y =+ dims.h

        const bodysize = 14  //pt

        doc.setFontType('normal')
        .setFontSize(bodysize)


        for( const section of sections.values() )
        {
            // IDEA set Text without chords (not happeining now)
            // by deselecting chords
            const textOnly = Array.from(section.querySelectorAll(':not(.chord)').values())
            .map( el => el.textContent )
            .reduce( (prev, curr) => prev + curr, '' )

            const lines = doc.splitTextToSize(textOnly, 90 )
            const linesHeight = bodysize * 0.352778 * 1.5 * lines.length
            if(last_y + linesHeight > 190) {
                last_y = start_y;
                if( last_x < 110 ) {
                    last_x += 90
                }
                else
                {
                    doc.addPage();
                    last_x = start_x;

                }

            }

            doc.text(lines, last_x, last_y, {lineHeightFactor: 1.5})

            last_y +=  linesHeight

        }



        
        // Save the Data
        // doc.save('Generated.pdf');
        const pdfData = doc.output('arraybuffer')
        this.pdfDoc = doc
        this.setState( {pdfData}) 
    }

    render() {
        // let pdfBlob = 

        let pdf = <></>
        if(this.state.pdfData) {
        let pdfBlobUrl =  window.URL.createObjectURL(new Blob([this.state.pdfData], { type: 'application/pdf' })); 
            pdf = <object data={pdfBlobUrl} width="100%" height="100%" type="application/pdf">
                <p>It appears you don't have a PDF plugin for this browser.
                No biggie... you can <a href="myfile.pdf">click here to
                download the PDF file.</a></p>
        </object>
        }
        return <div>
            <button onClick={ev => this.jsPdfGenerator(this.props.song.getHtml())} > Generate PDF </button> 
            <button onClick={ev => this.pdfDoc?.save(this.props.song.title_+'.pdf')} >Download PDF (Only FF) </button>
             {pdf}
             
             </div>

        

    }


}