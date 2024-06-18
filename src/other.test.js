//The test for the other.js program which only contains the clear function

import { clear } from './other.js';

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
});