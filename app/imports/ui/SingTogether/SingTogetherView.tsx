import classNames from 'classnames'
import * as React from 'react'
import { FunctionComponent } from 'react'
import Songs, { Room, Rooms } from '../../api/collections'
import { useScrollHideEffect, useScrollHideEffectRef } from '../../api/helpers'
import Sheet from '../Sheet'
import { SingTogetherCreate } from './SingTogetherCreate'
import { RelativeLink, useSong } from './SingTogetherHooks'




interface SingTogetherViewProps {
    room: Room
} 
export const SingTogetherView: FunctionComponent<SingTogetherViewProps> = ({room}) => {
  const selectedSongId = room.currentSongId
  const {song, songReady} = useSong(selectedSongId)

  const selectedSongs = room.songList.map( sid => Songs.findOne({_id: sid}) )

  
  const handleSongSelected = _songId => { Rooms.update(room._id, {$set: {currentSongId: _songId}})}

  const handleScroll = (ev: React.UIEvent) => { Rooms.update(room._id, {$set: {scrollPosition: ev.currentTarget.scrollTop}})}

  const ref = React.useRef()
  const showMenu = useScrollHideEffect()

  return <>
    <SingTogetherCreate room={room} />
    {/* <pre>{JSON.stringify(room)}</pre> */}

    <div id="st_nav" className={classNames({hidden: !showMenu})}>
      <button><RelativeLink l={'edit'} >Edit</RelativeLink></button>
      <div> 
        <ul>
          {selectedSongs.map( (s,idx) => 
            <li onClick={() => handleSongSelected(s._id) } 
              key={`${idx}_${s._id}`}>
              {s.title}
            </li>
          )}
        </ul>
      </div>
    </div>

    <div id="st_sheet" onScroll={handleScroll}>{song && <Sheet  song={song} transpose={0} /> }</div>
  </>
}



