import * as React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { FormEvent, FunctionComponent } from 'react'

export type keysEvent = React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement> | KeyboardEvent
type dec = [(e: keysEvent)=> boolean, string, string, number]
const updowns: dec[] =[
  [mult1,'*','/',1.2],
  [mult2, '*','/',2],
  [inc0, '+','-',0.1],
  [()=>true,'+','-',1]
]



export const QuickInput: FunctionComponent<{id: string, value: number, onChange: (a: number) => void}> = ({onChange, value,id}) => {


  const [mod, setMod] = useState(updowns[3])

  useEffect(() => {
    document.addEventListener('keydown', e => {
      setMod(decider(e))
    })
    document.addEventListener('keyup', e => {
      setMod(decider(e))
    })
  })

  const up = (e: keysEvent) => {
    e.preventDefault()
    const op = decider(e)
    onChange(eval(value+op[1]+op[3]))
  }

  const down = (e: keysEvent) => {
    e.preventDefault()
    const op = decider(e)
    onChange(eval(value+op[2]+op[3]))
  }

  const handleKey = (keyEvent: React.KeyboardEvent<HTMLInputElement>) => {
    if( keyEvent.key == 'ArrowUp' ) {
      up(keyEvent)
    }
    else if( keyEvent.key == 'ArrowDown' ) {
      down(keyEvent)
    }
  }

  const [,u,d,inc] = mod
  return <>
    <button onClick={ev => down(ev)}>{d}</button>
    <input type="number" step="1" min="1" max="200"
    onKeyDown={handleKey} id={id}
    value={value} onChange={ev => onChange( parseFloat(ev.currentTarget.value))} />
  <button onClick={ev => up(ev)}>{u}</button>
    {inc}

  </>
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


