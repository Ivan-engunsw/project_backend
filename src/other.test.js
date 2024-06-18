//The test for the other.js program which only contains the clear function

import { clear } from './other.js';
import { getData, setData } from './dataStore.js';

describe('clear', () => {
    // Test which ensure that clear return an empty object
    test('Clear returns an empty object', () => {
        const result = clear();
        expect(result).toEqual({});
    });

    // Test which ensures that clear returns a new empty object every time
    test('Clear returns a new empty object each time', () => {
        const result1 = clear();
        const result2 = clear();
        expect(result1).not.toBe(result2); 
    });

    test('Clear function resets the state', () => {
        //Setting some initial data
        setData({ users: [{ UserId: 1, name: 'Betty', email: 'bettybooptest@gmail.com' }],
                 quizzes: [{ id: 1, name: 'Quiz1' }] });
    
        let data = getData();
        expect(data).toEqual({ users: [{ UserId: 1, name: 'Betty', email: 'bettybooptest@gmail.com' }],
                                 quizzes: [{ id: 1, name: 'Quiz1' }] });
    
        //Calling the clear function
        clear();
    
        // Verifying if the data was reset
        data = getData();
        expect(data).toEqual({ users: [], quizzes: [] });
    });
});