
import * as jsPDF from 'jspdf'
import * as fpath from 'path'

export class Margins {
    top=10
    right= 10 
    bottom= 20
    left= 10

    tb = () => this.top + this.bottom
    lr = () => this.left + this.right
}

export class Cursor {
    x = 0
    _y = 0
    get y() {return this._y}
    set y(val) {this._y = val; console.log("y set:", this._y)}
}

export class ComfyPdfJs {
    /** exposing jsDocument */
    public doc : jsPDF

    cursor =  new Cursor()
    margins = new Margins()

    constructor(params, jsPdfParams: any[])
    {
        if( params.margins )
        {
            Object.assign(this.margins, params.margins)
        }

        this.doc = new jsPDF(...jsPdfParams)
        Object.assign( this.cursor,  {x: this.margins.top, y: this.margins.left} )
    }

    setFont(name: string, type: string, size: number) {
        this.doc.setFont(name).setFontType(type).setFontSize(size);
    }

    /**
     * Advances the cursor in y-direction
     * @param content 
     */
    textLine(content: string ) {
        const dims = this.doc.getTextDimensions(content)
        const lh = this.doc.getLineHeight()
        const w = this.doc.getTextWidth(content)
        this.doc.text(content, this.cursor.x, this.cursor.y, {baseline: 'top'})
        this.cursor.y += dims.h
    }

    /**
     * Advances the cursor in x-direction
     * @param content 
     */
    textFragment(content: string ) {
        const dims = this.doc.getTextDimensions(content)
        this.doc.text(content, this.cursor.x, this.cursor.y )
        this.cursor.x += dims.w
    }
    pageHeight = () => this.doc.internal.pageSize.getHeight()
    pageWidth = () => this.doc.internal.pageSize.getWidth()
    maxY = () => this.pageHeight() - this.margins.bottom
    maxX = () => this.pageWidth() - this.margins.bottom
    mediaWidth = () => this.doc.internal.pageSize.getWidth() - this.margins.lr()
    mediaHeight = () => this.doc.internal.pageSize.getHeight() - this.margins.tb()

    isTop = () => this.cursor.y *.999 < this.margins.top  

    async addFontXhr(path, fontname, type) {
        const filename = fpath.basename(path)
        const blob = await fetch(path).then( response =>  response.blob()  )

        return new Promise<string>((res,rej) => {
            const fr = new FileReader()
            // @ts-ignore: we know the result is a string by calling readAsDataURL
            fr.onload = () => res(fr.result.replace(/^data:.+;base64,/, ''))
            fr.readAsDataURL(blob)
        }).then(font => {
                this.doc.addFileToVFS(filename, font);
                this.doc.addFont(filename, fontname, type);
                return fontname
            });
    }
}



export class ChordPdfJs extends ComfyPdfJs {
    chordFont = ['RoCo', 'bold', 9] 
    textFont = ['RoCo', 'normal', 12] 
    placeChord(text, chord) {
        if (chord) {
            this.setFont.apply(this, this.chordFont)
            this.doc.text(chord, this.cursor.x, this.cursor.y - this.textFont[2]/this.doc.internal.scaleFactor)
        }
        this.setFont.apply(this, this.textFont)
        this.textFragment(text)

    }

}
