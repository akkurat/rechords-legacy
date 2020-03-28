import * as React from 'react'

import { IViewerProps } from './Viewer'

import * as jsPDF from 'jspdf'

import * as blobStream from 'blob-stream'
/// <reference types="@types/pdfkit/index.d.ts">
import * as PDFDocument from "../api/pdfkit.standalone.js"

interface IPdfViewerStates {
    pdfData: ArrayBuffer
    blobUrl: string
}


export class PdfViewer extends React.Component<IViewerProps, IPdfViewerStates> {
    constructor(props: IViewerProps) {
        super(props)
        this.state = {
            pdfData: undefined,
            blobUrl: undefined
        }
    }

    pdfDoc: jsPDF
    pdfKitDoc: PDFKit.PDFDocument

    componentDidUpdate( 
    oldProps: IViewerProps) {
        if (this.props.song != oldProps.song) {
            this.generatePdf()
        }

    }
    componentDidMount() {
        this.generatePdf()

    }

    generatePdf = () => {
        const vdom = this.props.song.getHtml()
        // this.jsPdfGenerator(vdom)
        this.pdfKit(vdom)
    }


    pdfKit = (vdom) => {
        if (!vdom)
            return;

        const cols= 3

        const html = new DOMParser().parseFromString(vdom, 'text/html')

        
        const doc = new PDFDocument({
            layout : 'landscape',
            size   : 'a4',
            margins: {
                top: 0, left: 0, bottom: 0, right: 0
            }
        })
        doc.font('Helvetica')
        //
        // doc.font('http://localhost:3000/fonts/Roboto-Regular-webfont.woff')
        // todo: using _fragment lowlevel function might be more apropriate
        function placeChord( text, chord) {
            if( chord ) {
                doc.text(chord, { baseline: 'bottom', continued: true});
                doc.x = doc.x - doc.widthOfString(chord);
            }
            let what = doc.text(text, { baseline: 'top', continued: true, lineBreak: false})

        }
        let x_pos =  doc.page.margins.left
        function resetX() {
            doc.x = x_pos
            doc.moveTo( x_pos, doc.y )
        }
        var stream = doc.pipe(blobStream());

        for( let section of html.querySelectorAll('section') )
        {

            const lines = section.querySelectorAll('span.line')



            if(doc.y + lines.length*24 + 30  > doc.page.height-doc.page.margins.bottom  )
            {
                // if(doc.x < doc.page.width * (1 - 1/cols) )
                x_pos += doc.page.width/cols;
                doc.y = doc.page.margins.top;
                    
            }
            resetX()
            doc.fontSize(25)
            // no linebreak gives as complete control over advancing y
            // however
            doc.y +=30
            doc.text( section.querySelector('h3').innerText, x_pos, doc.y, {lineBreak: false} )
            doc.fontSize(12)
            for (let line of lines ) {
                resetX()
                doc.y += 15;
                // if( line.querySelector('i[data-chord]') )
                    doc.y +=9
                const chords = line.querySelectorAll('i')
                for (let i=0; i<chords.length; i++ ) {
                    const chord = chords[i]
                    placeChord(chord.innerText, chord.dataset.chord)
                    console.log('after: ', chord.innerText, doc.x, doc.y,)
                }
                doc.text('')
            }
        }


        // end and display the document in the iframe to the right
        doc.end();
        stream.on('finish', () =>  {
            this.setState({blobUrl : stream.toBlobURL('application/pdf')});
        });

    }

    jsPdfGenerator = (vdom) => {

        if (!vdom)
            return;

        // TODO from here:
        // Interchangeable PDF creator: input html string, output is bytearray


        // browserParser, not react parser. has bit more functions like 
        // selectors...
        const mdHtml = new DOMParser().parseFromString(vdom, "text/html");

        const header = mdHtml.querySelector('.sd-header')

        const sections = mdHtml.querySelectorAll('section')



        var doc = new jsPDF('l', 'mm', 'a4')

        doc.setFont('helvetica').setFontType('bold').setFontSize(30);

        const start_x = 10, start_y = 20;
        let last_y = start_y, last_x = start_x;

        doc.text(last_x, last_y, header?.textContent)
        const dims = doc.getTextDimensions(header?.textContent)
        last_y = + dims.h

        const bodysize = 14  //pt

        doc.setFontType('normal')
            .setFontSize(bodysize)


        for (const section of sections.values()) {
            // IDEA set Text without chords (not happeining now)
            // by deselecting chords
            const textOnly = Array.from(section.querySelectorAll(':not(.chord)').values())
                .map(el => el.textContent)
                .reduce((prev, curr) => prev + curr, '')

            const lines = doc.splitTextToSize(textOnly, 90)
            const linesHeight = bodysize * 0.352778 * 1.5 * lines.length
            if (last_y + linesHeight > 190) {
                last_y = start_y;
                if (last_x < 110) {
                    last_x += 90
                }
                else {
                    doc.addPage();
                    last_x = start_x;

                }

            }

            doc.text(lines, last_x, last_y, { lineHeightFactor: 1.5 })

            last_y += linesHeight

        }




        // Save the Data
        // doc.save('Generated.pdf');
        const pdfData = doc.output('arraybuffer')
        this.pdfDoc = doc
        this.setState({ pdfData })
    }

    render() {
        // let pdfBlob = 

        let pdf = <></>
        if (this.state.pdfData) {
            let pdfBlobUrl = window.URL.createObjectURL(new Blob([this.state.pdfData], { type: 'application/pdf' }));
            pdf = <object data={pdfBlobUrl} width="100%" height="100%" type="application/pdf">
                <p>It appears you don't have a PDF plugin for this browser.
                No biggie... you can <a href="myfile.pdf">click here to
                download the PDF file.</a></p>
            </object>
        }
        let pdf_k = <></>
        if (this.state.blobUrl) {
            pdf = <object data={this.state.blobUrl} width="100%" height="100%" type="application/pdf">
                <p>It appears you don't have a PDF plugin for this browser.
                No biggie... you can <a href="myfile.pdf">click here to
                download the PDF file.</a></p>
            </object>
        }
        return <div>
            <button onClick={this.generatePdf}> Generate PDF </button>
            <a href={this.state.blobUrl}>Download PDF (Only FF) </a>
            {pdf}
            {pdf_k}
            <pre>{this.props.song.getHtml()}</pre>

        </div>



    }


}