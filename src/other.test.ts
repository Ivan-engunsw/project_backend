// The test for the other.js program which only contains the clear function

import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

describe('DELETE /v1/clear', () => {
  test('has the correct return type', () => {
    const res = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });
});

/*
import { adminAuthRegister, adminUserDetails } from './auth';
test('Clear removes all data', () => {
    const authUser = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
    clear();
    expect(adminUserDetails(authUser.authUserId)).toStrictEqual(ERROR);
  });
*/
