import * as error from './errors';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
export interface Data {
  users: User[];
  quizzes: Quiz[];
  trash: Quiz[]
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
  trash: []
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
export function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: Data) {
  data = newData;
}

// Interface for each token
interface Token {
  tokenId: string;
  authUserId: number;
}

// An array for storing tokens and their mappings to authUserIds
const tokens: Token[] = [];

// // An array for storing the deleted quizzes
// let quizTrash: Quiz[] = [];

// export function getTrash(): Quiz[] {
//   return quizTrash;
// }

// export function setTrash(newTrash: Quiz[]) {
//   quizTrash = newTrash;
// }

export type EmptyObject = Record<string, never>;

// Given an authUserId, generate a new key: tokenId to value: authUserId pair in the array
export function generateToken(authUserId: number): { token: string } {
  const randomBytes = require('randombytes');
  let tokenId: string = randomBytes(16).toString('base64url');
  while (tokens.find(token => token.tokenId === tokenId)) {
    tokenId = randomBytes(16).toString('base64url');
  }

  const token = {
    tokenId: tokenId,
    authUserId: authUserId,
  };

  tokens.push(token);

  return { token: tokenId };
}

// Check if the token provided is valid and return the authUserId on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function validToken(token: string): { authUserId: number } | error.ErrorObject {
  const foundUser = tokens.find(existingToken => existingToken.tokenId === token);
  return (foundUser) ? { authUserId: foundUser.authUserId } : error.InvalidToken(token);
}

// Remove the token from the array and return {} on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function removeToken(token: string): EmptyObject | error.ErrorObject {
  const existingTokenIndex = tokens.findIndex(existingToken => existingToken.tokenId === token);

  if (existingTokenIndex !== -1) {
    tokens.splice(existingTokenIndex, 1);
    return {};
  } else {
    return error.InvalidToken(token);
  }
}
