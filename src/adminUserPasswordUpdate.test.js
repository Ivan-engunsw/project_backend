import { clear } from './other';
import { adminAuthRegister, adminUserPasswordUpdate } from './auth';

const ERROR = { error: expect.any(String), errorCode: expect.any(Number) };

beforeEach(() => {
  clear();
});

describe('adminUserPasswordUpdate', () => {
  describe('Implementation Testing', () => {
    test('Successfully updates the password', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserPasswordUpdate(authUserId, '1234zyx#@', 'newpass1');
      expect(changed).toStrictEqual({});
    });
  });

  describe('Error Testing', () => {
    test('Case when authUserId is not valid', () => {
      const changed = adminUserPasswordUpdate(9999, '1234zyx#@', 'newpass1');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when old password is incorrect', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserPasswordUpdate(authUserId, 'wrongpassword', 'newpass1');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when old and new passwords match', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserPasswordUpdate(authUserId, '1234zyx#@', '1234zyx#@');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when new password has already been used before', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      adminUserPasswordUpdate(authUserId, '1234zyx#@', 'newpass1');
      adminUserPasswordUpdate(authUserId, 'newpass1', '12345abc');
      const changed = adminUserPasswordUpdate(authUserId, '12345abc', 'newpass1');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when new password is less than 8 characters', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserPasswordUpdate(authUserId, '1234zyx#@', 'short');
      expect(changed).toStrictEqual(ERROR);
    });

    test('Case when new password does not contain at least one number and one letter', () => {
      const { authUserId } = adminAuthRegister('originalemail@gmail.com', '1234zyx#@', 'Betty', 'Boop');
      const changed = adminUserPasswordUpdate(authUserId, '1234zyx#@', 'abcdefgh');
      expect(changed).toStrictEqual(ERROR);
    });
  });
});
