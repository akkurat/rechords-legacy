import { Meteor } from 'meteor/meteor'
import { useTracker } from 'meteor/react-meteor-data'
import { useRouteMatch } from 'react-router'
import { NavLink } from 'react-router-dom'
import Songs, { Rooms, Song } from '../../api/collections'
import * as React from 'react'
import { FunctionComponent } from 'react'
import { FC } from 'react-dom/node_modules/@types/react'
import { Mongo } from 'meteor/mongo'

export const useRooms = () => useTracker(() => { 
  const handle = Meteor.subscribe('rooms')
  return {rooms: Rooms.find({}).fetch(), ready: handle.ready()}
})

export const useRoom = (roomId:string) => useTracker(() => {
  const roomReady = Meteor.subscribe('rooms', roomId ).ready()
  const room = Rooms.findOne({_id: roomId})
  return {roomReady, room}
}, [roomId]) 

export const useSong = (songId: string) => useTracker(() => {
  const songReady = Meteor.subscribe('songs').ready()
  const song = Songs.findOne({_id: songId})

  return {song, songReady}
}, [songId])

export const useSongTitles = (filter?: string | Mongo.ObjectID | Mongo.Selector<Song>) => useTracker(() => {
  const songsReady = Meteor.subscribe('songs').ready()
  const songs = Songs.find(filter||{}, {fields:{ title: 1, author: 1} }).fetch() as {title: string, author:string, _id: string}[]

  return {songs, songsReady}
})

export const RelativeLink: FC<React.PropsWithChildren<{l:string}>> = ({l, children}) => {
  const match = useRouteMatch()
  return <NavLink to={match.url+'/'+l}>{children}</NavLink>
}
