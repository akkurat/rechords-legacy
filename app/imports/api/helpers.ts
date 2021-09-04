
export const userMayWrite = () => {
  const role = Meteor.user().profile.role;
  return role == 'admin' || role == 'writer';
}

/**
 * 
 * @param id 
 * @returns false, if id is undefined or not starting with ref-prefix
 */
import { refPrefix } from 'showdown-rechords';
export const isRefId = (id: string): boolean => id && id.startsWith(refPrefix)