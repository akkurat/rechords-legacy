
export const userMayWrite = () => {
  const role = Meteor.user().profile.role
  return role == 'admin' || role == 'writer'
}

import { useEffect, useRef, useState } from 'react'
/**
 * 
 * @param id 
 * @returns false, if id is undefined or not starting with ref-prefix
 */
import { refPrefix } from 'showdown-rechords'
import { ParsedSong, Song } from './collections'
import ChrodLib, { KeyAndScale } from './libchrod'
export const isRefId = (id: string): boolean => id && id.startsWith(refPrefix)


export function extractOrGuessKey(song: ParsedSong): KeyAndScale {
  const chords = song.getChords()
  const key_tag = song.getTag('tonart')
  let key = key_tag && ChrodLib.parseTag(key_tag)
  if (key == null) {
    key = ChrodLib.guessKey(chords)
  }
  return key
}


export const useScrollHideEffect = (): boolean => {
  const [showMenu, setShowMenu] = useState(true)

  type xy = [time: number, y: number]
  const last: React.MutableRefObject<[x:number,y:number]> = useRef()

  const hideIf = (current:xy) => {
    if(!last.current) {
      last.current = current
      return
    }
    const [[t0,y0],[t1,y1]] = [last.current,current]
    const dY = y1-y0, dT = t1-t0
    if( dY > 100 && dT > 1000 ) {
      last.current = undefined
      setShowMenu(false)
      return
    } 
    if( dY < -100) {
      last.current = undefined
      setShowMenu(true)
      return
    }
  }

  useEffect(() => {
    const handler = (ev: Event) => {
      hideIf([ev.timeStamp,window.scrollY])
    }
    document.addEventListener('scroll', handler)
    return () => document.removeEventListener('scroll',handler)
  },[])

  return showMenu
}