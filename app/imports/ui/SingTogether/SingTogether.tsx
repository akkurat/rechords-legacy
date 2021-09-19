import * as React from 'react'
import { FunctionComponent } from 'react'
import { FC } from 'react-dom/node_modules/@types/react'
import { NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom'
import Songs, { Room, Rooms } from '../../api/collections'
import { EmptyProps } from '../../api/helpers'
import TrackingDocumentTitle from '../TrackingDocumentTitle'
import { SingTogetherCreate } from './SingTogetherCreate'
import { RelativeLink, useRoom, useRooms, useSongTitles } from './SingTogetherHooks'
import { SingTogetherView } from './SingTogetherView'
import { DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import { useState } from 'react'
import classNames from 'classnames'




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
// Trailing comma helps the compiler not take it as an ReactElement
const reorder = <T,>(list: T[], startIndex, endIndex) => {
  const result: T[] = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
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

const RoomSonglistEdit: FC<{room: Room}> = ({room}) => {

  const handleDragEnd = (result:DropResult) => {
    const list = reorder(room.songList, result.source.index, result.destination.index)
    room.songList = list
    Rooms.update({_id: room._id}, {$set: {songList: list}} )
  }

  const selectedSongs = room.songList.map( sid => Songs.findOne({_id: sid}) )

  return <DragDropContext onDragEnd={handleDragEnd}>
    <Droppable droppableId="mydrop">
      {(providedo, snapshot) => (
        <ul
          {...providedo.droppableProps}
          ref={providedo.innerRef}
        >
          {selectedSongs.map( (s,idx) => <Draggable key={s._id} draggableId={s._id} index={idx}>
            {(provided, snapshot) => (
              <li
                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
              >
                {s.title}
              </li>
            )}
          </Draggable> 
          )}
          {providedo.placeholder}
        </ul>)}
    </Droppable>
  </DragDropContext>
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

  return ( <div id="st_nav">
    <NavLink exact to="/" >Home</NavLink>
    <NavLink exact to="/rooms">Rooms</NavLink>

    { roomId && <NavLink exact to={`/rooms/${roomId}`}>Room</NavLink> }
    { roomId && <NavLink exact to={`/rooms/${roomId}/edit`}>Edit</NavLink> }

  </div>
  )
}
