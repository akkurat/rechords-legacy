import { useTracker } from 'meteor/react-meteor-data'
import * as React from 'react'
import { useEffect } from 'react'
import { FunctionComponent, ReactElement, useState } from 'react'
import { useClickIndicator } from './ClickIndicator'
import { QuickInput } from './QuickInput'
import { Columns, Landscape, Portrait } from './SettingIcons'

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

export const PdfSettings: FunctionComponent<{ songId: string, consumer: (s: IPdfViewerSettings) => void }> = ({songId, consumer}) => {

  const {user} = useTracker(() => ({user: Meteor.user()}))

  const getInitialState: () => IPdfViewerSettings = () =>  user?.profile?.pdfSettings?.[songId] || user?.profile?.pdfSettings?.___ || new PdfViewerStates() 

  const [state, setState] = useState(getInitialState())

  const saveSettings = (_songId) => {
    const pdfSettings: {[k: string]: IPdfViewerSettings } = user?.profile?.pdfSettings || {}
    user.profile.pdfSettings = pdfSettings
    pdfSettings[_songId] = JSON.parse(JSON.stringify(state))
    Meteor.call('saveUser', user, (error) => console.log(error))
  }

  const loadSongDefaults = () => { set(getInitialState()) }
  const loadUserDefaults = () => {
    const settings = user?.profile?.pdfSettings?.___ || new PdfViewerStates()
    set(settings)
  }
  const loadStaticDefaults = () => { set(new PdfViewerStates()) }

  const set = ( a: IPdfViewerSettings ) => { setState(a); consumer(a) } 

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

  const orientations: [string,ReactElement, string][] = [
    // eslint-disable-next-line react/jsx-key
    ['p', Portrait, 'Portrait: 210mm x 297mm' ], ['l', Landscape, 'Landscape: 297mm x 210mm']
  ]
  const fontSizeHandles = []

  for (const fs in state.sizes) {
    if (Object.prototype.hasOwnProperty.call(state.sizes, fs)) {
      fontSizeHandles.push(<div className="fontsize">
        <label htmlFor={'font'+fs}>{fs}</label>
        <QuickInput id={'font'+fs} value={state.sizes[fs]} onChange={size => handleFontSize(fs, size)} />
      </div>
      )
    }
  }


  const [listener, Outlet] = useClickIndicator()
  return <div className="pdfSettings">
    <div className="grid">
      <div className="title">Orientation</div>
      <div className="setting orientations">{
        orientations.map(([value, icon, help], idx ) => (
          <>
            <input onClick={listener} alt={help} id={'or'+value}type="radio" name="orientation" value={value} checked={state.orientation == value} onChange={handleOrientationChange} />
            <label title={help} htmlFor={'or'+value} key={idx}>{icon}</label>
            <Outlet />
          </>
        ))}
      </div>
      <div className="title">Columns</div>
      <div className="setting columns">
        {[...new Array(4).keys()].map(idx => <> 
          <input
            onChange={handleColChange}
            checked={idx+1 === state.numCols} type="radio" id={`numColumns${idx}`} name="numColumns" value={idx+1} />
          <label htmlFor={'numColumns'+idx} title={`${idx+1}`}>
            <Columns numCols={idx+1} colWidth={10} gap={2} />
          </label>
        </>)} 
      </div>

      <div className="table">
        {fontSizeHandles}
      </div>

      <div className="title">Save / Restore</div>
      <div className="setting buttons">
        <button onClick={()=>saveSettings(songId)}>Save for this Song</button>
        <button onClick={loadSongDefaults}>Load Saved for this Song</button>
        <button onClick={()=>saveSettings('___')}>Save as User Default</button>
        <button onClick={loadUserDefaults}>Load User Defaults</button>
        <button onClick={loadStaticDefaults}>Load Defaults</button>
      </div>
    </div>
  </div>


}