import { getData, setData } from './dataStore.js'
/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */
function clear() {
    let data = getData();
    setData(data = {
        users: [],
        quizzes: [],
    });
    return {      
    };
}

export { clear };