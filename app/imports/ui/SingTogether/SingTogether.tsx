import * as React from 'react'
import { FunctionComponent } from 'react'
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom'
import { Room } from '../../api/collections'
import { EmptyProps } from '../../api/helpers'
import TrackingDocumentTitle from '../TrackingDocumentTitle'
import { SingTogetherCreate } from './SingTogetherCreate'
import { useRooms } from './SingTogetherHooks'
import { SingTogetherView } from './SingTogetherView'




export const SingTogether: FunctionComponent<EmptyProps> = () => {

  const {url, path} = useRouteMatch()


  return <div id="singtogether">

    <Switch>

      <Route path={`${path}`} exact={true} >
        <SingingRoomLobby />
      </Route>

      <Route path={`${path}/:roomId`}>
        <RoomOverview />
      </Route>

    </Switch>

  </div>

}

const RoomOverview: FunctionComponent<Record<string,never>> = () => {

  const match = useRouteMatch<{roomId: string}>()


  const roomId: string = match.params?.roomId
  const {room, roomReady} = useRoom(roomId)
  if( roomReady ) {

    return (
      <>
        <TrackingDocumentTitle title={'Hölibu | Room'} />
        <SingTogetherCreate room={room} />
        <SingTogetherView room={room} />
      </>
    )
  } else {
    return <h1>Room loading....</h1>
  }
}

export const SingingRoomLobby: FunctionComponent = () => {
  const rooms = useRooms()
  const roomElements = rooms.ready ? rooms.rooms.map( (r: Room, i) => <li key={i}>{createNavlink(r)}</li>) : <li>Loading Rooms...</li> 
  return <>
    <TrackingDocumentTitle title="Hölibu | New Room" />
    <div id="st_rooms">
      <ul>
        {roomElements}
      </ul>
    </div>
    <SingTogetherCreate /> 
  </>
}
