import { getData, setData, EmptyObject, getTrash, setTrash } from './dataStore';
/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */

export function clear(): EmptyObject {
  const dataStore = getData();
  dataStore.users = [];
  dataStore.quizzes = [];
  setData(dataStore);
  let trash = getTrash();
  trash = [];
  setTrash(trash);
  return {};
}
