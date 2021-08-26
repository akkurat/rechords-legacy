import * as React from 'react'
import { useEffect } from 'react'
import { FunctionComponent, ReactElement, useState } from 'react'
import { LayoutH, LayoutV } from '../Icons.jsx'
import { QuickInput } from './QuickInput.js'

// TODO: save settings like liked songs in user db
export class PdfViewerStates implements IPdfViewerSettings {
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


export interface IPdfViewerSettings {
    numCols: number;
    orientation: 'l' | 'p'
    sizes: ITextSizes
}
export interface ITextSizes {
    header: number
    section: number
    text: number
    chord: number
    gap: number
}

export const PdfSettings: FunctionComponent<{ consumer: (s: IPdfViewerSettings) => void }> = ({consumer}) => {

  const [state, setState] = useState(new PdfViewerStates())
  const set = ( a: IPdfViewerSettings ) => {
    setState(a)
    consumer(a)
  } 

  useEffect( () => set(state), [])


  const handleColChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    set({ ...state, numCols: parseInt(ev.currentTarget.value) })
  }
  const handleOrientationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    set({ ...state, orientation: event.currentTarget.value })
  }

  const handleFontSize = (name, value) => {

    const newFontSizes = state.sizes
    newFontSizes[name] = value
    set(
      // copying object in order not having to detect the state change in deep @componentDidUpdate
      { ...state, sizes: newFontSizes }
    )

  }

  const orientations: [string,ReactElement][] = [
    // eslint-disable-next-line react/jsx-key
    ['p', <LayoutV />], ['l', <LayoutH />]
  ]
  const fontSizeHandles = []

  for (const fs in state.sizes) {
    if (Object.prototype.hasOwnProperty.call(state.sizes, fs)) {
      fontSizeHandles.push(<div>
        
        <label htmlFor={'font'+fs}>{fs}: </label>
        <QuickInput id={'font'+fs} value={state.sizes[fs]} onChange={size => handleFontSize(fs, size)} />
      </div>
      )
    }
  }

  return <div className="pdfSettings">
      <div className="table">
    <div>{
      orientations.map(([value, icon], idx ) => (
        <>
          <input id={'or'+value}type="radio" name="orientation" value={value} checked={state.orientation == value} onChange={handleOrientationChange} />
          <label htmlFor={'or'+value} key={idx}>{icon} </label>
        </>
      ))}
    </div>
    <div>
      <input id="numColumns" type="number" min="1" max="5" onChange={handleColChange} value={state.numCols} />
      <label htmlFor="numColumns">Spalten </label>
    </div>
    </div>

    <h5>Font Sizes </h5>
    <div className="table">
    {fontSizeHandles}
    </div>
  </div>

}