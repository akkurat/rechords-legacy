import { useTracker } from 'meteor/react-meteor-data'
import Slider from 'rc-slider'
import * as React from 'react'
import { useEffect } from 'react'
import { FunctionComponent, ReactElement, useState } from 'react'
import { useClickIndicator } from './ClickIndicator'
import { QuickInput } from './QuickInput'
import { Columns, Landscape, Portrait } from './SettingIcons'
import * as I from '../Icons.jsx'

// TODO: save settings like liked songs in user db



export class PdfViewerStates implements IPdfViewerSettings {
    numCols = 3
    orientation: 'l' | 'p' = 'l'
    inlineReferences: false
    includeComments: false
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
    inlineReferences: boolean
    includeComments: boolean
    sizes: ITextSizes
}
export interface ITextSizes extends Record<string,number> {
    header: number
    section: number
    text: number
    chord: number
    gap: number
}

export const PdfSettings: FunctionComponent<{ songId: string, consumer: (s: IPdfViewerSettings) => void }> = ({songId, consumer}) => {

  const {user} = useTracker(() => ({user: Meteor.user()}))

  type sug = 's' | 'u' | 'g'

  const settings: Record<sug, IPdfViewerSettings> = {s: user?.profile?.pdfSettings?.[songId], u: user?.profile?.pdfSettings?.___, g: new PdfViewerStates() }
  const getInitialState: () => IPdfViewerSettings = () =>  settings.s || settings.u || settings.g

  const [state, setState] = useState(getInitialState())

  const saveSettings = (_songId) => {
    const pdfSettings: {[k: string]: IPdfViewerSettings } = user?.profile?.pdfSettings || {}
    user.profile.pdfSettings = pdfSettings
    pdfSettings[_songId] = JSON.parse(JSON.stringify(state))
    Meteor.call('saveUser', user, (error) => console.log(error))
  }

  const loadSongDefaults = () => { set(getInitialState()) }
  const loadUserDefaults = () => { set(settings.u || settings.g) }
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

  const setInlineRefs = (val: boolean) => {
    set({...state, inlineReferences: val})
  }

  const setComments = (val: boolean) => {
    set({...state, includeComments: val})
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


      // const marks = {}
      // for( const k of Object.keys(settings) ) {
      //   if( settings[k]?.sizes ) { 
      //     const sizes = settings[k as sug].sizes
      //     const size = sizes[fs]
      //     marks[size]= k 
      //   }
      // }


      fontSizeHandles.push(<div className="fontsize">
        <label htmlFor={'font'+fs}>{fs}</label>
        <Slider 
          min={1} max={settings.g.sizes[fs]*2-1} value={state.sizes[fs]} onChange={s => handleFontSize(fs, s)}
          // marks={marks}
        />
        <QuickInput id={'font'+fs} value={state.sizes[fs]} onChange={size => handleFontSize(fs, size)} />
      </div>
      )
    }
  }
  const [listener, Outlet] = useClickIndicator()
  const cross = <svg width="20px" height="20px">
    <rect className="box" x="0" y="0" width="20px" height="20px" rx="5px" ry="5px" />
    <line className="cross" x1="4" y1="4" x2="16px" y2="16px" /> 
    <line className="cross" x1="4" y2="4" x2="16px" y1="16px" /> 
  </svg>

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

      <div className="title">Text</div>
      <div className="setting">
        <div className="fullwidth">
          <input id="inlineShit" checked={state.inlineReferences} type="checkbox" onClick={e=> setInlineRefs(e.target.checked)} />
          <label htmlFor="inlineShit" title="Repeat text of each Reference?" className="fullwidth">{cross}Inline References</label>
        </div>
        <div className="fullwidth">
          <input id="includeComments" checked={state.includeComments} type="checkbox" onClick={e=> setComments(e.target.checked)} />
          <label htmlFor="includeComments" title="Repeat text of each Reference?" className="fullwidth" >{cross}Show Comments</label>
        </div>

      </div>

      <div className="save-row">
        <div className="icon"><I.Note /></div>
        <div className="buttons">
          <button onClick={()=>saveSettings(songId)} className="icon"><I.Ok /></button>
          <button onClick={loadSongDefaults} className="icon"><I.Cancel /></button>
        </div>
      </div>
      <div className="save-row">
        <div className="icon"><I.User /></div>
        <div className="buttons">
          <button onClick={()=>saveSettings('___')} className="icon"><I.Ok /></button>
          <button onClick={loadUserDefaults} className="icon"><I.Cancel /></button>
        </div>
      </div>
      <div className="save-row">
        <div className="icon"><I.Globe /></div>
        <div className="buttons">
          <button onClick={loadStaticDefaults} className="icon"><I.Cancel /></button>
        </div>
      </div>
    </div>
  </div>


}