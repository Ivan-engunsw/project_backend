import isEmail from 'validator/lib/isEmail';
import { Data, EmptyObject, getData, setData } from './dataStore';
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
  const data = getData();
  const randomBytes = require('randombytes');

  let tokenId: string;
  do { tokenId = randomBytes(16).toString('base64url'); }
  while (data.tokens.find(token => token.tokenId === tokenId));

  data.tokens.push({ tokenId: tokenId, authUserId: authUserId });

  setData(data);

  return { token: tokenId };
}

// Check if the token provided is valid and return the authUserId on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function validToken(tokenId: string): { authUserId: number } | error.ErrorObject {
  const tokens = getData().tokens;
  const token = tokens.find(token => token.tokenId === tokenId);
  return (token) ? { authUserId: token.authUserId } : error.InvalidToken(tokenId);
}

// Remove the token from the array and return {} on success or error if invalid
// NOTE: Token is just a string, not the object { token: string }
export function removeToken(tokenId: string): EmptyObject | error.ErrorObject {
  const data = getData();
  const tokenIndex = data.tokens.findIndex(token => token.tokenId === tokenId);

  if (tokenIndex === -1) { return error.InvalidToken(tokenId); }

  data.tokens.splice(tokenIndex, 1);
  setData(data);
  return {};
}
