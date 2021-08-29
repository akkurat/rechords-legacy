import * as React from 'react'
import { Ref, useRef, useState } from 'react'
import { useEffect } from 'react'
import { FunctionComponent } from 'react'
import { throttle } from 'underscore'

export type keysEvent = React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<HTMLInputElement> | KeyboardEvent


export const useListener = (target: EventTarget, type: keyof GlobalEventHandlersEventMap, listener, options? ): () => void => {
  target.addEventListener(type, listener, options)
  // returning deregistering lambda (consistent with useEffect)
  return () => {target.removeEventListener(type, listener )}
}
type dec = [(e: keysEvent)=> boolean, string, string, number, number]
// const arrowIcons:[string,string][] = [
//   ['u', 'd'],
//   ['uu','dd'],
//   ['U︎','D'],
//   ['UU', 'DD'],
// ] 
const updowns: dec[] =[
  [mult1,'*','/',1.2,2],
  [mult2, '*','/',2,3],
  [inc0, '+','-',0.1,0.5],
  [()=>true,'+','-',1,1]
]

export const QuickInput: FunctionComponent<{id: string, value: number, onChange: (a: number) => void}> = ({onChange, value,id}) => {

  const [mod, setMod] = useState(updowns[3])

  useEffect(() => {
    const abc = new AbortController()
    const opt = {signal: abc.signal}

    const listener: any = e => { setMod(decider(e)) }
    const deregisters = [
      useListener(document, 'keydown', listener, opt),
      useListener(document, 'keyup', listener, opt),
      useListener(window, 'blur', listener, opt)
    ]

    // Alternatively 
    // deregisters.forEach(d => d())
    return () => { abc.abort() }
  })

  const up = (e: keysEvent) => {
    e.preventDefault()
    const op = decider(e)
    onChange(Math.round(eval(value+op[1]+op[3])*10)/10)
  }

  const down = (e: keysEvent) => {
    e.preventDefault()
    const op = decider(e)
    onChange(Math.round(eval(value+op[2]+op[3])*10)/10)
  }

  const handleKey = (keyEvent: React.KeyboardEvent<HTMLInputElement>) => {
    if( keyEvent.key == 'ArrowUp' ) {
      up(keyEvent)
    }
    else if( keyEvent.key == 'ArrowDown' ) {
      down(keyEvent)
    }
  }

  /**
   * Used by Wheel Capture
   */
  let wheelbuffer = 0;
  const changeValueThrottled = throttle( () => {
    onChange(Math.round((value+wheelbuffer)*10)/10)
    wheelbuffer=0;
   }, 100 )

  const ref: Ref<HTMLDivElement> = useRef()

  const handleWheel = (ev: WheelEvent) => {
    ev.preventDefault()
    ev.stopPropagation()
    wheelbuffer = wheelbuffer + ev.deltaY/100;
    changeValueThrottled()
  }
  // Avoiding Propagation works only using native addEventListener()
  // https://github.com/facebook/react/issues/5845
  useEffect( () => {
    ref?.current.addEventListener('wheel',handleWheel)
    return () => {
      ref?.current.removeEventListener('wheel',handleWheel )
    }
  }, [])

  const intensity = 1.2;
  return <div className="quickinput" ref={ref} >
    <svg width="120px" height="40px" overflow="visible">
      <g transform="translate(0,20)">
      <polyline points="-100,0, 40,0" />
      <polygon onClick={down} points={`40,0 50,${intensity*10} 60,0`} />
      <polyline points="60,0 100,0" />
      <polygon onClick={up} points={`100,0 110,${-10*intensity} 120,0`} />
      </g>
      <foreignObject x="65px" y="0px" height="20px" width="30px">
      <input type="number" min="1" max="200" style={{ width: "30px", height: "20px", textAlign: 'center'}}
        onKeyDown={handleKey} id={id} onFocus={ev => ev.target.select()}
        value={value} 
        onChange={ev => onChange( parseFloat(ev.currentTarget.value))} />
      </foreignObject>
      {/* <text x="50%" y="50%" textAnchor="middle" alignmentBaseline="middle">
        Gagi
      </text> */}
    </svg>


  </div>
}

function inc0(keyEvent: keysEvent) {
  return keyEvent.shiftKey
}

function mult2(keyEvent: keysEvent) {
  return keyEvent.metaKey || keyEvent.ctrlKey
}

function mult1(keyEvent: keysEvent) {
  return keyEvent.altKey
}

function decider(e: keysEvent): dec {
  for( const ud of updowns ) {
    if( ud[0](e) ) return ud
  }
}


