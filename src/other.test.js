// The test for the other.js program which only contains the clear function

import { clear } from './other.js';
import { adminAuthRegister, adminUserDetails } from './auth.js';

const ERROR = { error: expect.any(String) };

describe('clear', () => {
  // Test which ensure that clear return an empty object
  test('Clear returns an empty object', () => {
    const result = clear();
    expect(result).toEqual({});
  });

  test('Clear removes all data', () => {
    const authUser = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
    clear();
    expect(adminUserDetails(authUser.authUserId)).toStrictEqual(ERROR);
  });
});
