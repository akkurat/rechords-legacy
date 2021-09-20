import classNames from 'classnames'
import { Meteor } from 'meteor/meteor'
import * as React from 'react'
import { Ref } from 'react'
import { PropsWithChildren } from 'react'
import { MouseEventHandler, useEffect } from 'react'
import { FC } from 'react-dom/node_modules/@types/react'
import { Link } from 'react-router-dom'
import { useScrollHideEffect } from '../api/helpers'
import { Menu } from './Icons.jsx'


import './mobileMenuStyle.less'

interface MobileMenuProps extends React.HTMLProps<HTMLElement> {
    toggleSongList: MouseEventHandler,
    songListHidden: boolean
}


export const MobileMenu: FC<MobileMenuProps> = (p) => {

  const showMenu = useScrollHideEffect()

  const toggle = ev => p.toggleSongList(ev)

  const classes = classNames(
    'mobilemenu', 
    {'hide-extensions': !p.songListHidden},
    {'noheight': !showMenu}
  )

  return <div className={classes} >
    <span onClick={toggle} id="menu"><Menu /></span>
    <span className="username"> 
      <Link onClick={toggle} to="/user">{Meteor.user().profile.name}</Link>
    </span>
  </div>
}


export const MobileMenuShallow: FC<PropsWithChildren<Record<string,never>>> = ({children}) => {

  const showMenu = useScrollHideEffect()

  console.log(showMenu)

  const classes = classNames(
    'mobilemenu', 
    'extend', 
    {'noheight': !showMenu}
  )

  return <div className={classes}>
    {children}
  </div>
}


