import isEmail from 'validator/lib/isEmail';
import { Data, EmptyObject, getData } from './dataStore';
import * as error from './errors';

// time
export const timeNow = () => Math.floor(Date.now() / 1000);

// user
export const validUserName = (name: string) => /^[a-zA-Z' -]{2,20}$/.test(name);
export const validUserPass = (pass: string) => /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(pass);
export const getUserByEmail = (data: Data, email: string) => data.users.find(user => email === user.email);
export const getUserById = (data: Data, id: number) => data.users.find(user => id === user.userId);

// email
export const validEmail = (email: string) => isEmail(email);
export const takenEmail = (data: Data, email: string) => data.users.some(user => user.email === email);

// quiz
export const validQuizName = (name: string) => /^[a-zA-Z0-9 ]{3,30}$/.test(name);
export const validQuizDesc = (desc: string) => desc.length <= 100;
export const takenQuizName = (data: Data, uId: number, qName: string) => data.quizzes.some(quiz => quiz.name === qName && quiz.userId === uId);
export const getQuizById = (data: Data, id: number) => data.quizzes.find(quiz => id === quiz.quizId);

// token
// Given an authUserId, generate a new key: tokenId to value: authUserId pair in the array
export function generateToken(authUserId: number): { token: string } {
  const tokens = getData().tokens
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
  const tokens = getData().tokens
  const foundUser = tokens.find(existingToken => existingToken.tokenId === token);
  return (foundUser) ? { authUserId: foundUser.authUserId } : error.InvalidToken(token);
}

// Remove the token from the array and return {} on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function removeToken(token: string): EmptyObject | error.ErrorObject {
  const tokens = getData().tokens
  const existingTokenIndex = tokens.findIndex(existingToken => existingToken.tokenId === token);

  if (existingTokenIndex !== -1) {
    tokens.splice(existingTokenIndex, 1);
    return {};
  } else {
    return error.InvalidToken(token);
  }
}
