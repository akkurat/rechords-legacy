import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import * as React from 'react'
import { FunctionComponent } from 'react'
import Songs, { Room, Rooms, Song } from '../../api/collections'
import List from '../List'
import Sheet from '../Sheet'
import Viewer from '../Viewer'




interface SingTogetherViewProps {
    room: Room
} 
export const SingTogetherView: FunctionComponent<SingTogetherViewProps> = ({room}) => {
  const selectedSongId = room.currentSongId
  const {song, songReady} = useSong(selectedSongId)
  const {songs, songsReady} = useSongTitles()

  const selectedSongs = room.list.map( sid => Songs.findOne({_id: sid}) )

  const handleSongAdd = _id => { Rooms.update(room._id, {$push: {list: _id}})} 
  
  const handleSongSelected = _songId => { Rooms.update(room._id, {$set: {currentSongId: _songId}})}

  const handleScroll = (ev: React.UIEvent) => { Rooms.update(room._id, {$set: {scrollPosition: ev.currentTarget.scrollTop}})}

  return < >
    <div id="st_available">
      {songsReady && <ul>{songs.map( (s, idx) => <li onClick={() => handleSongAdd(s._id)} key={idx+s._id}>{s.title + ' ' + s.author}</li> ) } </ul>}
    </div>
    {/* <pre>{JSON.stringify(room)}</pre> */}

    <div id="st_selected">
      <ul>
        {selectedSongs.map( (s,idx) => <li onClick={() => handleSongSelected(s._id) } key={`${idx}_${s._id}`}>{s.title}</li>)}
      </ul>
    </div>

    <div id="st_sheet" onScroll={handleScroll}>{song && <Sheet  song={song} transpose={0} /> }</div>
  </>
}