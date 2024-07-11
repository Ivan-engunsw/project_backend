import isEmail from 'validator/lib/isEmail';
import { Random } from 'random-js';
import { Data, EmptyObject, Quiz, getData, setData } from './dataStore';
import { QuestionBody } from './quiz';
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
export const generateQuizId = () => {
  const data = getData();
  const random = new Random();
  let quizId: number;
  do { quizId = random.integer(0, Number.MAX_SAFE_INTEGER); }
  while (data.quizzes.find(quiz => quiz.quizId === quizId) || data.trash.find(quiz => quiz.quizId === quizId));
  return quizId;
};
export const sumDuration = (quiz: Quiz) => quiz.questions.reduce((sum, question) => sum + question.duration, 0);

// question
export const validQuestionBody = (questionBody: QuestionBody, quiz: Quiz): EmptyObject | error.ErrorObject => {
  // Check the length of the question
  if (!(validQuestion(questionBody.question))) { return error.invalidQuestion(questionBody.question); }

  // Check the number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return error.invalidNumAnswers(questionBody.answers.length);
  }

  // Check the duration
  if (questionBody.duration < 0) { return error.invalidDuration(questionBody.duration); }

  // Check the duration of the quiz with the new question
  if (sumDuration(quiz) + questionBody.duration > 180) {
    return error.invalidQuizDuration(sumDuration(quiz) + questionBody.duration);
  }

  // Check the points of the question
  if (questionBody.points < 1 || questionBody.points > 10) {
    return error.invalidPoints(questionBody.points);
  }

  // Check the length of each answer
  if (questionBody.answers.find(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    return error.invalidAnswerLen();
  }

  // Check for duplicate answers
  const answersSoFar: string[] = [];
  for (const answer of questionBody.answers) {
    if (answersSoFar.includes(answer.answer)) {
      return error.duplicateAnswer(answer.answer);
    } else {
      answersSoFar.push(answer.answer);
    }
  }

  // Check there is at least 1 correct answer
  if (!questionBody.answers.some(answer => answer.correct === true)) {
    return error.noCorrectAnswer();
  }

  return {};
};

const validQuestion = (question: string) => /^.{5,50}$/.test(question);
export const generateQuestionId = (quizId: number) => {
  const data = getData();
  const quiz = getQuizById(data, quizId);
  const random = new Random();
  let questionId: number;
  do { questionId = random.integer(0, Number.MAX_SAFE_INTEGER); }
  while (quiz.questions.find(question => question.questionId === questionId));
  return questionId;
};

export const getQuestionById = (quiz: Quiz, id: number) => quiz.questions.find(question => id === question.questionId);
export const validNewPosition = (quiz: Quiz, position: number, currentPosition: number) => (position >= 0 && position < quiz.questions.length && position !== currentPosition);

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
