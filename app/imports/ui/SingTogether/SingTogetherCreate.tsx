import { Meteor } from 'meteor/meteor'
import * as React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { FunctionComponent } from 'react'
import { Room } from '../../api/collections'


export const SingTogetherCreate: FunctionComponent<{room?: Room}> = ({room, id="st_create"}) => 
{
  const handleCreate = () => {
    Meteor.call('createRoom', {caption})
  }    
  const handleUpdate = () => {
    Meteor.call('updateRoom', {_id: room._id, caption} )
  }    

  const [caption, setCaption] = useState(room?.caption||'')

  useEffect( () => setCaption(room?.caption||''), [room])
   
  return <div id={id}>
      
    {/* <pre>{JSON.stringify(room, undefined, 2)}</pre> */}
    <input value={caption} onChange={ev => setCaption(ev.target.value)} />
    {room ?
      <><button onClick={handleUpdate}
      >Update Room</button>
      <span>{room.scrollPosition}</span>
      </>
      :
      <button onClick={handleCreate}
      >Create Room</button>
    } 
  </div>

    


} 