
export const userMayWrite = () => {
  const role = Meteor.user().profile.role
  return role == 'admin' || role == 'writer'
}

/**
 * 
 * @param id 
 * @returns false, if id is undefined or not starting with ref-prefix
 */
import { refPrefix } from 'showdown-rechords'
import { ParsedSong, Song } from './collections'
import ChrodLib, { KeyAndScale } from './libchrod'
export const isRefId = (id: string): boolean => id && id.startsWith(refPrefix)


export function extractOrGuessKey(song: ParsedSong): KeyAndScale {
  const chords = song.getChords()
  const key_tag = song.getTag('tonart')
  let key = key_tag && ChrodLib.parseTag(key_tag)
  if (key == null) {
    key = ChrodLib.guessKey(chords)
  }
  return key
}