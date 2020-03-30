import * as React from 'react'

import { IViewerProps } from './Viewer'
import { ChordPdfJs } from '../api/comfyPdfJs'


class PdfViewerStates {
    pdfData: ArrayBuffer = undefined
    numCols = 3
    orientation: 'l' | 'p' = 'l'
    fontSizes = {
        header: 50,
        section: 20,
        text: 16,
        chord: 11
    }
}


export class PdfViewer extends React.Component<IViewerProps, PdfViewerStates> {
    constructor(props: IViewerProps) {
        super(props)
        this.state = new PdfViewerStates()
    }


    componentDidUpdate( 
    oldProps: IViewerProps, oldState: PdfViewerStates) {
        if (this.props.song != oldProps.song || 
            this.state.numCols != oldState.numCols ||
            this.state.orientation != oldState.orientation ||
            this.state.fontSizes != oldState.fontSizes
            ) {
            this.generatePdf()
        }

    }
    componentDidMount() {
        this.generatePdf()

    }

    generatePdf = () => {
        const vdom = this.props.song.getHtml()
        this.jsPdfGenerator(vdom)
        // this.pdfKit(vdom)
    }


    jsPdfGenerator = async (vdom) => {

        if (!vdom)
            return;

        
        const fos = this.state.fontSizes

        const mdHtml = new DOMParser().parseFromString(vdom, "text/html");


        const sections = mdHtml.querySelectorAll('section')

        const cdoc = new ChordPdfJs({}, [this.state.orientation, 'mm', 'a4'])

        const doc = cdoc.doc
        const cols = this.state.numCols
        let x0 = cdoc.margins.left

        await Promise.all([
            cdoc.addFontXhr('/fonts/Roboto_Condensed/RobotoCondensed-Light.ttf', 'RoCo', 'light'),
            cdoc.addFontXhr('/fonts/Roboto_Condensed/RobotoCondensed-Bold.ttf', 'RoCo', 'bold'),
            cdoc.addFontXhr('/fonts/Roboto_Condensed/RobotoCondensed-Regular.ttf', 'RoCo', 'normal')
        ])

        cdoc.chordFont = ['RoCo', 'bold', fos.chord]
        cdoc.textFont = ['RoCo', 'normal', fos.text]

        const songArtist = mdHtml.querySelector('.sd-header>h2')
        cdoc.setFont('RoCo', 'bold', fos.section)
        cdoc.textLine( songArtist.textContent )
        cdoc.cursor.y += fos.section / doc.internal.scaleFactor

        const songTitle = mdHtml.querySelector('.sd-header>h1')
        cdoc.setFont('RoCo', 'light', fos.header)
        cdoc.textLine(songTitle.textContent)


        for (const section of sections.values()) {
            // IDEA set Text without chords (not happeining now)
            // by deselecting chords

            const lines = section.querySelectorAll('span.line')

            const contentheight =  Array.from(lines)
                .map(getLineHeight)
                .reduce((prev,curr) => prev + curr)

            if(cdoc.cursor.y + contentheight + 5  > cdoc.maxY()  )
            {
                x0 += cdoc.mediaWidth()/cols;
                cdoc.cursor.y = cdoc.margins.top
                if(x0> cdoc.maxX()){
                    doc.addPage()
                    x0 = cdoc.margins.left
                }

            }
            resetX()
            if(!cdoc.isTop())
                cdoc.cursor.y += fos.section * 2 / doc.internal.scaleFactor // fonts are in point... 
            

            cdoc.setFont('RoCo', 'bold', fos.section)
            cdoc.textLine( section.querySelector('h3').innerText )

            for (let line of lines ) {
                resetX()
                cdoc.cursor.y += getLineHeight(line)
                const chords = line.querySelectorAll('i')
                for (let i=0; i<chords.length; i++ ) {
                    const chord = chords[i]
                    cdoc.placeChord(chord.innerText, chord.dataset.chord)
                    // console.log(chord.innerText, JSON.stringify(cdoc.cursor))
                }
            }
        }

        // Save the Data
        const pdfData = doc.output('arraybuffer')
        this.setState({ pdfData })

        function getLineHeight( line ) : number {
                if( line.querySelector('i[data-chord]') )
                    return (fos.text * 1.2 +fos.chord )/ doc.internal.scaleFactor
                return fos.text*1.3 / doc.internal.scaleFactor
        }
        function resetX() {
           cdoc.cursor.x = x0 

        }
    }

    render() {
        // let pdfBlob = 


        const fontSizeHandles = []

        for (const fs in this.state.fontSizes) {
            if (Object.prototype.hasOwnProperty.call(this.state.fontSizes, fs)) {
                fontSizeHandles.push(<span>
                    <label>{fs}</label>
                    <input type="number" step=".5" min="1" max="200" value={this.state.fontSizes[fs]} onChange={ev => this.handleFontSize(fs, parseFloat(ev.currentTarget.value))} /> 
                </span>
                )
            }
        }


        return <div id="pdfViewer">
            {/* <button onClick={this.generatePdf}> Generate PDF </button> */}
            <label>Spalten</label>
            <input type="number" min="1" max="5" onChange={this.handleColChange} value={this.state.numCols}/>
            <span>
            <input id="o-l" type="radio" name="orientation" value="l" checked={this.state.orientation == 'l'} onChange={this.handleOrientationChange} />
            <label htmlFor="o-l">Quer</label>
            <input id="o-p" type="radio" name="orientation" value="p" checked={this.state.orientation == 'p'} onChange={this.handleOrientationChange} />
            <label htmlFor="o-p">Hoch</label>
            </span>

            <label>Sizes: </label>
            {fontSizeHandles}
            <PdfBlob pdfData={this.state.pdfData}></PdfBlob>

            {/* <pre>{this.props.song.getHtml()}</pre> */}

        </div>



    }



    private handleColChange =  (ev: React.ChangeEvent<HTMLInputElement>) => 
         { this.setState({ numCols: parseInt(ev.currentTarget.value) })
    }
    private handleOrientationChange =  (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        //@ts-ignore
        this.setState({orientation: event.currentTarget.value})
    }

    private handleFontSize =  (name, value) =>  {



        this.setState( state =>  {
            const newFontSizes = state.fontSizes
            newFontSizes[name] = value
            // copying object in order not having to detect the state change in deep @componentDidUpdate
            return {fontSizes: Object.assign({}, newFontSizes)}
        })
        
    }
    

}

const PdfBlob : React.FunctionComponent< React.PropsWithChildren<{pdfData: ArrayBuffer}>> = (props) => {

        let pdf = <></>
        if (props.pdfData) {
            let pdfBlobUrl = window.URL.createObjectURL(new Blob([props.pdfData], { type: 'application/pdf' }));
            pdf = <><object data={pdfBlobUrl} width="100%" height="100%" type="application/pdf">
                <p>It appears you don't have a PDF plugin for this browser.
                No biggie... you can <a href="myfile.pdf">click here to
                download the PDF file.</a></p>
            </object>
            <a href={pdfBlobUrl}>Download PDF </a>
            </>

        }
        return pdf
}

