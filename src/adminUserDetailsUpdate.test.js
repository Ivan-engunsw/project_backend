import { clear } from './other';
import { adminAuthRegister, adminUserDetailsUpdate } from './auth';

const ERROR = { errorMsg: expect.any(String), errorCode: expect.any(Number) };

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
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when email is invalid', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserDetailsUpdate(authUserId, 'invalid-email', 'Bratty', 'Dorp');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when email is used by another user', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      adminAuthRegister('anotheremail@gmail.com', '1234zyx#@', 'Jane', 'Dorp');
      const changed = adminUserDetailsUpdate(authUserId, 'anotheremail@gmail.com', 'Bratty', 'Dorp');
      expect(changed).toStrictEqual(ERROR);
    });

    test.each([
      { nameFirst: 'Br@tty' },
      { nameFirst: 'Br55TTy' },
    ])('Case when nameFirst contains invalid characters', ({ nameFirst }) => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      expect(adminUserDetailsUpdate(authUserId, 'anotheremail@gmail.com', nameFirst, 'Dorp')).toStrictEqual(ERROR);
    });

    test('Case when nameFirst is less than 2 characters', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'B', 'Dorp');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when nameFirst is more than 20 characters', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'B'.repeat(21), 'Dorp');
      expect(changed).toStrictEqual(ERROR);
    });

    test.each([
      { nameLast: 'Do@p' },
      { nameLast: 'D3op' },
    ])('Case when nameLast contains invalid characters', ({ nameLast }) => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      expect(adminUserDetailsUpdate(authUserId, 'anotheremail@gmail.com', nameLast, 'Dorp')).toStrictEqual(ERROR);
    });

    test('Case when nameLast is less than 2 characters', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Bratty', 'D');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when nameLast is more than 20 characters', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserDetailsUpdate(authUserId, 'Updatedemail@gmail.com', 'Bratty', 'D'.repeat(21));
      expect(changed).toStrictEqual(ERROR);
    });
  });
});
