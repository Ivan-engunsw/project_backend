import {getData, setData} from './dataStore.js';
/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */
function clear() {
    let data = getData();
    data = {
        users: [],
        quizzes: [],
    };
    setData(data);
    return {
        
    };
}

export { clear };
