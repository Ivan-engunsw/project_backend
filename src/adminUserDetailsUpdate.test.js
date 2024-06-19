import { clear } from './other.js';
import { adminAuthRegister, adminUserDetailsUpdate } from './auth.js';

beforeEach(() => {
    clear();
});

describe('adminUserDetailsUpdate', () => {    

    describe('Implementation Testing', () => {
        test('Successfully updates user details', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Bratty', 'Dorp');
            expect(changed).toStrictEqual({}); 
        });
    });
    
    describe('Error Testing', () => {
        test('Case when authUserId is not valid', () => {
            const changed = adminUserDetailsUpdate(9999, 'Updatedemail@gmail.com', 'Bratty', 'Dorp');
            expect(changed).toStrictEqual({ error: 'AuthUserId is not a valid user.' });
        });
    
        test('Case when email is invalid', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'invalid-email', 'Bratty', 'Dorp');
            expect(changed).toStrictEqual({ error: 'Email does not satisfy validator.isEmail.' });
        });
    
        test('Case when email is used by another user', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            adminAuthRegister('anotheremail@gmail.com', '1234zyx#@', 'Jane', 'Dorp');
            const changed = adminUserDetailsUpdate(authUserId, 'anotheremail@gmail.com', 'Bratty', 'Dorp');
            expect(changed).toStrictEqual({ error: 'Email is currently used by another user.' });
        });
    
        test('Case when email is not valid', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'invalidemail', 'Bratty', 'Dorp');
            expect(changed).toStrictEqual({ error: 'Email does not satisfy validator.isEmail.' });
        });
    
        test('Case when nameFirst contains invalid characters', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Br@tty', 'Dorp');
            expect(changed).toStrictEqual({ error: 'NameFirst contains invalid characters.' });
        });
    
        test('Case when nameFirst is less than 2 characters', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'B', 'Dorp');
            expect(changed).toStrictEqual({ error: 'NameFirst is less than 2 characters.' });
        });
    
        test('Case when nameFirst is more than 20 characters', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'B'.repeat(21), 'Dorp');
            expect(changed).toStrictEqual({ error: 'NameFirst is more than 20 characters.' });
        });
    
        test('Case when nameLast contains invalid characters', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Bratty', 'Do@p');
            expect(changed).toStrictEqual({ error: 'NameLast contains invalid characters.' });
        });
    
        test('Case when nameLast is less than 2 characters', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Bratty', 'D');
            expect(changed).toStrictEqual({ error: 'NameLast is less than 2 characters.' });
        });
    
        test('Case when nameLast is more than 20 characters', () => {
            const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
            const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Bratty', 'D'.repeat(21));
            expect(changed).toStrictEqual({ error: 'NameLast is more than 20 characters.' });
        });
    });
  
});
