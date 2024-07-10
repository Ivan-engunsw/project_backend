import { getData, setData, EmptyObject } from './dataStore';
/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */

export function clear(): EmptyObject {
  const dataStore = getData();
  dataStore.users = [];
  dataStore.quizzes = [];
  dataStore.trash = [];
  setData(dataStore);
  return {};
}
