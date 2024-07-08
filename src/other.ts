import { getData, setData } from './dataStore';
/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */

export function clear(): Record<string, never> {
  const dataStore = getData();
  dataStore.users = [];
  dataStore.quizzes = [];
  setData(dataStore);
  return {};
}
