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

export interface TokenData {
  tokens: Token[];
}

export interface Token {
  tokenId: string;
  authUserId: number;
}

const tokenData: TokenData = {
  tokens: [],
};

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

function generateToken(authUserId: number): { token: string } {
  const randomBytes = require('randombytes');
  let tokenId = randomBytes(16).toString('base64url');
  while (tokenData.tokens.find((token) => token.tokenId === tokenId)) {
    tokenId = randomBytes(16).toString('base64url');
  }

  const token = {
    tokenId: tokenId,
    authUserId: authUserId,
  };

  tokenData.tokens.push(token);

  return { token: tokenId };
}

function validToken(token: { token: string }): Token | error.ErrorObject {
  let foundToken;
  if ((foundToken = tokenData.tokens.find((existingToken) => existingToken.tokenId === token.token))) {
    return foundToken;
  } else {
    return error.InvalidToken(token.token);
  }
}

function removeToken(token: { token: string }): boolean | error.ErrorObject {
  let tokenIndex;
  if ((tokenIndex = tokenData.tokens.findIndex((existingToken) => existingToken.tokenId === token.token)) !== -1) {
    tokenData.tokens.splice(tokenIndex, 1);
    return true;
  } else {
    return error.InvalidToken(token.token);
  }
}

export { getData, setData, generateToken, validToken, removeToken };
