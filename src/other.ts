import {
  getData,
  setData,
  EmptyObject,
  clearMap
} from './dataStore';
import * as error from './errors';
import { generateId } from './helper';

/**
 * Reset the state of the application back to the start.
 * @returns {{}} - empty object
 */

export function clear(): EmptyObject {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.tokens = [];
  data.trash = [];
  data.sessions = [];
  clearMap();
  setData(data);
  return {};
}

/**
 * Given an authUserId, generate a new key: tokenId to value: authUserId pair in the array
 *
 * @param authUserId
 * @returns
 */
export function generateToken(authUserId: number): {
  token: string
} {
  const data = getData();

  let tokenId: string;
  do {
    tokenId = generateId('string') as string;
  }
  while (data.tokens.find(token => token.tokenId === tokenId));

  data.tokens.push({
    tokenId: tokenId,
    authUserId: authUserId
  });

  setData(data);

  return {
    token: tokenId
  };
}

// Check if the token provided is valid and
// return the authUserId on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function validToken(tokenId: string): {
  authUserId: number
} {
  const tokens = getData().tokens;
  const token = tokens.find(token => token.tokenId === tokenId);
  if (token) {
    return { authUserId: token.authUserId };
  } else {
    throw new Error(error.InvalidToken(tokenId));
  }
}

// Remove the token from the array and return {} on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function removeToken(tokenId: string): EmptyObject {
  const data = getData();
  const tokenIndex = data.tokens.findIndex(token => token.tokenId === tokenId);

  if (tokenIndex === -1) {
    throw new Error(error.InvalidToken(tokenId));
  }

  data.tokens.splice(tokenIndex, 1);
  setData(data);
  return {};
}
