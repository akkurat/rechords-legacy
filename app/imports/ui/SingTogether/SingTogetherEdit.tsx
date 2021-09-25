
import * as React from 'react'
import { FC } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import Songs, { Room, Rooms } from '../../api/collections'

export const RoomSonglistEdit: FC<{room: Room}> = ({room}) => {

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

// Trailing comma helps the compiler not take Generic T as a ReactElement
export const reorder = <T,>(list: T[], startIndex, endIndex) => {
  const result: T[] = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}