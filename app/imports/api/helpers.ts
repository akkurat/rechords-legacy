
export const userMayWrite = () => {
  const role = Meteor.user().profile.role
  return role == 'admin' || role == 'writer'
}

import { Ref, RefObject, useEffect, useRef, useState } from 'react'
/**
 * 
 * @param id 
 * @returns false, if id is undefined or not starting with ref-prefix
 */
import { refPrefix } from 'showdown-rechords'
import { throttle } from 'underscore'
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


/**
 * Setting boolean flag after scroll
 * @returns 
 */
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


/**
 * Setting height direcly 
 * @returns 
 */
export const useScrollHideEffectRef = (ref: RefObject<HTMLElement>,maxheight: number): void => {

  type xy = [time: number, y: number]

  useEffect(() => {
    // This only works if effect is called only once
    // -> giving [] as deps ensures this
    let last: xy
    let height = maxheight
    let ticking = false

    const hideIf = (current:xy) => {
      if(!last) {
        last = current
        return
      }

      if(!ref.current) {return}

      if(!ticking) { 
        requestAnimationFrame(() => {
          const [[t0,y0],[t1,y1]] = [last, current]
          const dY = -(y1-y0), dT = t1-t0

          const newHeight = Math.min(maxheight, Math.max(height+ dY, 0) ) 
          console.log(y0,y1,newHeight, dY, height)
          if(height !== newHeight ) {
            height = newHeight

            const crap = maxheight - newHeight
            ref.current.style.transformOrigin = `left ${maxheight}px`
            const factor = (newHeight/maxheight)
            ref.current.style.transform = ` translateY(${-crap}px) scaleY(${factor}) skewX(${-(1-factor)*35}deg) `

            last = undefined
          }
          last = current
          ticking =false
        }) 
      }
      // a handle to requestAnimFrame was submitted...
      ticking = true
    }
    const handler = (ev: Event) => {
      hideIf([ev.timeStamp,window.scrollY])
    }
    document.addEventListener('scroll', handler)
    return () => document.removeEventListener('scroll',handler)
  },[])
}
