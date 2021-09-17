
import jsPDF from 'jspdf'
import * as fpath from 'path'

export class Margins {
    top=10
    right= 10 
    bottom= 10
    left= 10

    tb = () => this.top + this.bottom
    lr = () => this.left + this.right
}

export class Cursor {
  constructor(public x=0, public y=0) {
  }
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
      this.doc.setFont(name).setFontType(type).setFontSize(size)
    }

    /**
     * Advances the cursor in y-direction
     * @param content 
     */
    textLine(content: string, simulate=false ) : {w: number, h: number}{
      if(!content) {return {w:0, h:0}}
      const dims = this.doc.getTextDimensions(content)
      if(!simulate) {
        this.doc.text(content, this.cursor.x, this.cursor.y, {baseline: 'top'})
        this.cursor.y += dims.h
      }
      return dims
    }

    /**
     * Advances the cursor in x-direction
     * @param content 
     */
    textFragment(content: string, simulate=false ) : {w: number, h: number} {
      const dims = this.doc.getTextDimensions(content)
      if(!simulate) {
        this.doc.text(content, this.cursor.x, this.cursor.y)
        this.cursor.x += dims.w
      }
      return dims
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
        this.doc.addFileToVFS(filename, font)
        this.doc.addFont(filename, fontname, type)
        return fontname
      })
    }
}



type ChordBaseSuff = {
    base: string
    suff: string
}

export class ChordPdfJs extends ComfyPdfJs {
    chordFont: [string,string,number] = ['RoCo', 'bold', 9] 
    textFont:[string,string,number] = ['RoCo', 'normal', 12] 
    placeChord(text: string, chord:ChordBaseSuff) {
      let wchord = 0
      if (chord) {
        this.setFont(...this.chordFont)
        const wbase = this.doc.getTextWidth(chord.base) + this.chordFont[2]/this.doc.internal.scaleFactor
        const wsuff = this.doc.getTextWidth(chord.suff) + this.chordFont[2]/this.doc.internal.scaleFactor
        this.doc.text(chord.base, this.cursor.x, this.cursor.y - this.textFont[2]/this.doc.internal.scaleFactor)
        this.doc.text(chord.suff, this.cursor.x+wbase, this.cursor.y )
        wchord = wbase+wsuff
      }
      this.setFont(...this.textFont)
      // this.textFragment(text)
      const wtext = this.doc.getTextWidth(text)
      this.doc.text(text, this.cursor.x, this.cursor.y )
      this.cursor.x += wtext > wchord ? wtext : wchord

    }

    

    /**
     * 
     * @param fragments 
     * @param width 
     * @param simulate if true, cursor will not be modified
     * 
     * @returns distance moved in y direction // tbd internal cursor?
     */
    placeChords(fragments: {text: string, chord: ChordBaseSuff }[], width: number, simulate=false) : {advance_y: number, numlineBreaksInserted: number, intCursor: Cursor} {
      let w = 0, br = 0

      const intCursor = new Cursor(this.cursor.x, this.cursor.y)
        
      const tfs = this.textFont[2] / this.doc.internal.scaleFactor
      const cfs = this.chordFont[2] / this.doc.internal.scaleFactor
      const einzug = 1.5 * tfs

      const chordMap = new Map<number, ChordBaseSuff>()
      let charCnt = 0
      let accText = ''
      for( const {text, chord} of fragments ) {
        if( chord ) {
          chordMap.set(charCnt,chord)
        }
        accText += text
        charCnt += text.length
      }

      this.setFont(...this.textFont)
      const lines_: string[] = this.doc.splitTextToSize(accText, width)
      const notFirstLines = this.doc.splitTextToSize(lines_.slice(1).join(''), width-einzug)
      const lines = lines_.length > 1 ? [lines_[0], ...notFirstLines] : lines_

      br = lines.length - 1




      const keys = Array.from(chordMap.keys() )

      const chordLines: [string,[number,ChordBaseSuff][]][] = [] 

      let minPos = 0, maxPos = 0
      for( const line of lines ) {
        maxPos = minPos + line.length 
        const lineChords: [number,ChordBaseSuff][] = keys.filter( v => minPos <= v && maxPos > v )
          .map( v => [v-minPos, chordMap.get(v)] )
        minPos = maxPos
        chordLines.push([line, lineChords])

      }



      let first = true
      for( const [line, chords] of chordLines ) {
        intCursor.y += tfs * 1.2
        if(chords.length)
          intCursor.y += cfs
        this.setFont(...this.chordFont)
        let xpos = intCursor.x, lastidx = 0
        let firstChord = true
        for( const [idx,chord] of chords ) {
          const text = line.substr(lastidx, idx-lastidx) || ''
          this.setFont(...this.textFont)
          const wtext = this.doc.getTextWidth(text)
          this.setFont(...this.chordFont)
          const chord_ = chord.base + chord.suff
          const wbase = this.doc.getTextWidth(chord.base)
          xpos += firstChord ? wtext : Math.max(wtext, this.doc.getTextWidth(chord_) + 0.5*tfs ) 
          if(!simulate) {
            this.doc.text(chord.base, xpos, intCursor.y - tfs) 
            this.doc.setFontSize(this.chordFont[2]*.7)
            this.doc.text(chord.suff, xpos + wbase, intCursor.y - tfs - this.chordFont[2]/this.doc.internal.scaleFactor*0.3) 
          }
          lastidx = idx
          firstChord = false
        }

        this.setFont(...this.textFont)
        if(!simulate)
          this.doc.text(line, intCursor.x, intCursor.y) 
        if(first) {
          intCursor.x += einzug
          first = false
        }
      }

      const returnValue = { advance_y: intCursor.y-this.cursor.y, numlineBreaksInserted: br, intCursor: intCursor}
      if(!simulate)
        Object.assign(this.cursor, intCursor)

      return returnValue

    }

    
}

