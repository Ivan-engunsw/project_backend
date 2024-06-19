import { setData } from './dataStore.js'
/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */
function clear() {
    setData({users: [],
             quizzes: [],
    });
    return {      
    };
}

export { clear };
