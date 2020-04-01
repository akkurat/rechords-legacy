import * as React from 'react'

import { IViewerProps } from './Viewer'
import { ChordPdfJs } from '../api/comfyPdfJs'


class PdfViewerStates {
    pdfBlobUrl: string = ''
    numCols = 3
    orientation: 'l' | 'p' = 'l'
    sizes = {
        header: 50,
        section: 20,
        text: 16,
        chord: 11,
        gap: 3
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
            this.state.sizes != oldState.sizes
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

        
        /** font sizes  */
        const fos = this.state.sizes

        const mdHtml = new DOMParser().parseFromString(vdom, "text/html");


        const sections = mdHtml.querySelectorAll('section')

        const cdoc = new ChordPdfJs({}, [this.state.orientation, 'mm', 'a4'])

        const doc = cdoc.doc
        const cols = this.state.numCols
        const colWidth = (cdoc.mediaWidth() - (cols - 1) * this.state.sizes.gap) / cols

        let x0 = cdoc.margins.left

        await Promise.all([
            cdoc.addFontXhr('/fonts/Roboto_Condensed/RobotoCondensed-Light.ttf', 'RoCo', 'light'),
            cdoc.addFontXhr('/fonts/Roboto_Condensed/RobotoCondensed-Bold.ttf', 'RoCo', 'bold'),
            cdoc.addFontXhr('/fonts/Roboto_Condensed/RobotoCondensed-Regular.ttf', 'RoCo', 'normal')
        ])

        cdoc.chordFont = ['RoCo', 'bold', fos.chord]
        cdoc.textFont = ['RoCo', 'normal', fos.text]


        const songArtist = mdHtml.querySelector('.sd-header>h2')
        cdoc.setFont('RoCo', 'normal', fos.section)
        const dima = cdoc.textLine( songArtist.textContent )
        cdoc.cursor.y += fos.section / doc.internal.scaleFactor

        const songTitle = mdHtml.querySelector('.sd-header>h1')
        cdoc.setFont('RoCo', 'light', fos.header)
        const dimt = cdoc.textLine(songTitle.textContent)

        const header = { y: cdoc.cursor.y, x: x0+Math.max(dima.w, dimt.w)}

        function placeFooter() {
            cdoc.setFont('RoCo', 'bold', fos.chord )
            doc.text(songTitle.textContent + ' - ' + songArtist.textContent, cdoc.margins.left + cdoc.mediaWidth()/2,  cdoc.maxY(), 'center' )
        }
        placeFooter()

        for (const section of sections.values()) {
            // IDEA set Text without chords (not happeining now)
            // by deselecting chords


            const contentheight = placeSection(section, true) 

            if(cdoc.cursor.y + contentheight  > cdoc.maxY()  )
            {
                const c = cdoc.cursor
                const g = this.state.sizes.gap
                x0 += colWidth + g;
                cdoc.cursor.y = x0 > header.x ? cdoc.margins.top : header.y
                // for debugging purposes
                // doc.line(x0-g, c.y, x0-g, c.y+cdoc.mediaHeight())
                // doc.line(x0, c.y, x0, c.y+cdoc.mediaHeight())
                if(x0> cdoc.maxX()){
                    doc.addPage()
                    x0 = cdoc.margins.left
                    header.y = cdoc.margins.top
                    placeFooter()
                }

            }

            placeSection(section)
        }

        // to think about: instead of simulation flag simulation cursor. that 
        // would simplify everthingj
        function placeSection(section: HTMLElement, simulate=false) : number {

            let advance_y = 0

            const lines = section.querySelectorAll('span.line')
            resetX()
            const lineHeight = fos.section * 2 / doc.internal.scaleFactor
            if(!cdoc.isTop())
                if(!simulate)
                    cdoc.cursor.y += lineHeight // fonts are in point... 
                    advance_y += lineHeight

            cdoc.setFont('RoCo', 'bold', fos.section)
            advance_y = cdoc.textLine( section.querySelector('h3').innerText, simulate ).h

            for (let line of lines ) {
                resetX()
                const chords = line.querySelectorAll('i')
                const fragments = Array.from(chords).map( c => ({text: c.innerText, chord: c.dataset.chord}))
                advance_y += cdoc.placeChords(fragments, colWidth, simulate).advance_y
            }
            return advance_y
        }

        function placePageNumbers() {
            
            //@ts-ignore not yet added to types :( )
            const total = doc.getNumberOfPages()

            for( let i= 1; i<=total; i++) {
                doc.setPage(i)
                cdoc.setFont('RoCo', 'bold', fos.chord)
                doc.text(i + ' / ' +total, cdoc.margins.left + cdoc.mediaWidth(), cdoc.maxY(), 'right')
            }
        }

        placePageNumbers()

        // Save the Data
        const pdfData = doc.output('arraybuffer')
        let pdfBlobUrl = window.URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
        URL.revokeObjectURL(this.state.pdfBlobUrl) // freeing old url for memory
        this.setState({ pdfBlobUrl })

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

        for (const fs in this.state.sizes) {
            if (Object.prototype.hasOwnProperty.call(this.state.sizes, fs)) {
                fontSizeHandles.push(<span>
                    <label>{fs}</label>
                    <input type="number" step=".5" min="1" max="200" value={this.state.sizes[fs]} onChange={ev => this.handleFontSize(fs, parseFloat(ev.currentTarget.value))} /> 
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
            <PdfBlob url={this.state.pdfBlobUrl}></PdfBlob>

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
            const newFontSizes = state.sizes
            newFontSizes[name] = value
            // copying object in order not having to detect the state change in deep @componentDidUpdate
            return {sizes: Object.assign({}, newFontSizes)}
        })
        
    }
    

}

const PdfBlob : React.FunctionComponent< React.PropsWithChildren<{url: string}>> = (props) => {

        let pdf = <></>
        if (props.url) {
            pdf = <><object data={props.url} width="100%" height="100%" type="application/pdf">
                <p>It appears you don't have a PDF plugin for this browser.
                No biggie... you can <a href={props.url}>click here to
                download the PDF file.</a></p>
            </object>
            <a href={props.url}>Download PDF </a>
            </>

        }
        return pdf
}

