
export type xy = [time: number, y: number]

export const userMayWrite = () => {
  const role = Meteor.user().profile.role
  return role == 'admin' || role == 'writer'
}

import { Meteor } from 'meteor/meteor'
import { RefObject, useEffect, useRef, useState } from 'react'
/**
 * 
 * @param id 
 * @returns false, if id is undefined or not starting with ref-prefix
 */
import { refPrefix } from 'showdown-rechords'
import { ParsedSong } from './collections'
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


class ScrollHysteresis {
    private last: xy
    constructor(public scrollTo: number, public scrollUp: number) {}
    hideIf(current:xy, callBack: (v: boolean) => void) {
      if(!this.last) {
        this.last= current
        return
      }
      const [[t0,y0],[t1,y1]] = [this.last,current]
      const dY = y1-y0, dT = t1-t0
      if( dY > this.scrollTo) {
        this.last= undefined
        callBack(false)
        return
      } 
      if( dY < -this.scrollUp) {
        this.last = undefined
        callBack(true)
        return
      }
    }
}

/**
 * Setting boolean flag after scroll
 * @returns 
 */
export const useScrollHideEffect = (scrollDown=48, scrollUp=10): boolean => {
  const [showMenu, setShowMenu] = useState(true)

  useEffect(() => {
    const hyst = new ScrollHysteresis(scrollDown, scrollUp)
    const handler = (ev: Event) => {
      hyst.hideIf([ev.timeStamp,window.scrollY], setShowMenu)
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
export const useScrollHideEffectRef = (ref: RefObject<HTMLElement>,maxheight: string|number,
  scrollContainer = window): void => {

  type xy = [time: number, y: number]

  const [,maxheight__, unit] = typeof maxheight === 'string' ? maxheight.match(/(\d+)([a-z]+)/) : [undefined,maxheight, 'px']
  const maxheight_ = typeof maxheight__ === 'string' ? parseFloat(maxheight__) : maxheight__

  useEffect(() => {
    // This only works if effect is called only once
    // -> giving [] as deps ensures this
    let last: xy
    let height = maxheight_
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

          const newHeight = Math.min(maxheight_, Math.max(height+ dY, 0) ) 
          console.log(y0,y1,newHeight, dY, height)
          if(height !== newHeight ) {
            height = newHeight

            const crap = maxheight_ - newHeight
            ref.current.style.transformOrigin = `left ${maxheight_}${unit}`
            const factor = (newHeight/maxheight_)
            ref.current.style.transform = ` translateY(${-crap}${unit}) scaleY(${factor}) skewX(${-(1-factor)*35}deg) `

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
      hideIf([ev.timeStamp,scrollContainer.scrollY])
    }
    scrollContainer.addEventListener('scroll', handler)
    return () => scrollContainer.removeEventListener('scroll',handler)
  },[])
}

export type EmptyProps = Record<string,never>
