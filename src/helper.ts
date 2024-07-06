import isEmail from 'validator/lib/isEmail';
import { Data } from './dataStore';

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
