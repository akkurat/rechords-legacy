import * as React from 'react'
import { FC, FunctionComponent, useRef } from 'react'
import { NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom'
import { Room, Rooms } from '../../api/collections'
import { EmptyProps, useScrollHideEffectRef } from '../../api/helpers'
import TrackingDocumentTitle from '../TrackingDocumentTitle'
import { SingTogetherCreate } from './SingTogetherCreate'
import { RelativeLink, useRoom, useRooms, useSongTitles } from './SingTogetherHooks'
import { SingTogetherView } from './SingTogetherView'
import { useState } from 'react'
import classNames from 'classnames'
import { RoomSonglistEdit } from './SingTogetherEdit'
import { MobileMenuShallow } from '../MobileMenu'




export const SingTogether: FunctionComponent<EmptyProps> = () => {

  const {url, path} = useRouteMatch()


  return <>
    <Switch>

      <Route path={`${path}`} exact={true}>
        <SingingRoomLobby />
      </Route>

      <Route path={`${path}/:roomId/edit`}>
        <RoomEdit />
      </Route>

      <Route path={`${path}/:roomId`}>
        <RoomView />
      </Route>

    </Switch>
  </>


}

const RoomEdit: FC<EmptyProps> = () => {
  const params = useParams<{roomId: string}>()
  const {room, roomReady} = useRoom(params.roomId)
  const [addSongOpen,setAddSongOpen] = useState(false)
  if( !roomReady) {
    return <h2>Loading Room</h2>
  }

  return <div className="st_page" id="st_roomedit">
    <div id="st_available" className={classNames({open: addSongOpen})}>
      <RoomAvailableSongs room={room}/>
      <button className="mobile" onClick={()=>setAddSongOpen(false)}>Close</button>
    </div>
    <div id="st_selected" className={classNames({open: !addSongOpen})}>
      <button className="mobile" onClick={()=>setAddSongOpen(true)}>Add Song</button>
      <RoomSonglistEdit room={room}/>
    </div>

    <SingTogetherNav />
  </div>
}

const RoomAvailableSongs: FC<{room: Room}> = ({room}) => {
  const {songs,songsReady} = useSongTitles({_id: {$nin: room.songList}})
  const handleSongAdd = _id => { Rooms.update(room._id, {$push: {songList: _id}})} 
  if(!songsReady) {
    return <h1>Songs loading...</h1>
  }
  return <>
    {songsReady && <ul>{songs.map( (s, idx) => <li onClick={() => handleSongAdd(s._id)} key={idx+s._id}>{s.title + ' ' + s.author}</li> ) } </ul>}
  </>
}


const RoomView: FunctionComponent<Record<string,never>> = () => {

  const {roomId} = useParams<{roomId: string}>()
  const {room, roomReady} = useRoom(roomId)

  if( roomReady ) {

    return (
      <div id="st_roomview" className="st_page">
        <TrackingDocumentTitle title={'Hölibu | Room'} />
        <SingTogetherView room={room} />
        <SingTogetherNav />
      </div>
    )
  } else {
    return <h1>Room loading....</h1>
  }
}

export const SingingRoomLobby: FunctionComponent = () => {
  const rooms = useRooms()
  const rommLinks = rooms.ready ? rooms.rooms.map( (r: Room, i) => <li key={i}>
    <RelativeLink l={r._id}>
      {r.getCaption()}
    </RelativeLink>
  </li>) : <li>Loading Rooms...</li> 
  return <div id="st_roomlobby" className="st_page">
    <TrackingDocumentTitle title="Hölibu | New Room" />
    <div id="st_rooms">
      <ul>
        {rommLinks}
      </ul>
    </div>
    <SingTogetherCreate /> 
    <SingTogetherNav />
  </div>
}

const SingTogetherNav: FC<EmptyProps> = () => {

  console.log('here?')
  const {roomId} = useParams<{roomId: string}>()

  const ref = useRef()
  useScrollHideEffectRef(ref, '3rem')

  return ( <MobileMenuShallow>
    <NavLink exact to="/" >Home</NavLink>
    <NavLink exact to="/rooms">Rooms</NavLink>

    { roomId && <NavLink exact to={`/rooms/${roomId}`}>Room</NavLink> }
    { roomId && <NavLink exact to={`/rooms/${roomId}/edit`}>Edit</NavLink> }

  </MobileMenuShallow>
  )
}
