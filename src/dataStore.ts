import * as error from './errors';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
export interface Data {
  users: User[];
  quizzes: Quiz[];
}

export interface User {
  userId: number;
  name: string;
  email: string;
  password: string;
  oldPwords?: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Quiz {
  quizId: number;
  userId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
}

let data: Data = {
  users: [],
  quizzes: [],
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  data = newData;
}

// A map data structure for storing tokenId mappings to authUserIds
const tokenMap: Map<string, number> = new Map();

type EmptyObject = Record<string, never>;

// Given an authUserId, generate a new key: tokenId to value: authUserId pair in the map
function generateToken(authUserId: number): { token: string } {
  const randomBytes = require('randombytes');
  let tokenId: string = randomBytes(16).toString('base64url');
  while (tokenMap.has(tokenId)) {
    tokenId = randomBytes(16).toString('base64url');
  }

  tokenMap.set(tokenId, authUserId);

  return { token: tokenId };
}

// Check if the token provided is valid and return the authUserId on success or error if invalid
function validToken(token: { token: string }): number | error.ErrorObject {
  let foundToken;
  if ((foundToken = tokenMap.get(token.token))) {
    return foundToken;
  } else {
    return error.InvalidToken(token.token);
  }
}

// Remove the token from the map and return {} on success or error if invalid
function removeToken(token: { token: string }): EmptyObject| error.ErrorObject {
  if (tokenMap.delete(token.token)) {
    return {};
  } else {
    return error.InvalidToken(token.token);
  }
}

export { getData, setData, generateToken, validToken, removeToken };
