import isEmail from 'validator/lib/isEmail';

// time
export const timeNow = () => Math.floor(Date.now() / 1000);

// user
export const validUserName = name => /^[a-zA-Z' -]{2,20}$/.test(name);
export const validUserPass = pass => /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(pass);
export const getUserByEmail = (data, email) => data.users.find(user => email === user.email);
export const getUserById = (data, id) => data.users.find(user => id === user.userId);

// email
export const validEmail = email => isEmail(email);
export const takenEmail = (data, email) => data.users.some(user => user.email === email);

// quiz
export const validQuizName = name => /^[a-zA-Z0-9_ ]{3,30}$/.test(name);
export const validQuizDesc = desc => desc.length <= 100;
export const takenQuizName = (data, uId, qName) => data.quizzes.some(quiz => quiz.name === qName && quiz.userId === uId);
export const getQuizById = (data, id) => data.quizzes.find(quiz => id === quiz.quizId);
