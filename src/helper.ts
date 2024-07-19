import isEmail from 'validator/lib/isEmail';
import {
  Random
} from 'random-js';
import {
  Data,
  EmptyObject,
  Quiz,
  getData
} from './dataStore';
import {
  QuestionBody
} from './quiz';
import * as error from './errors';
import crypto from 'crypto';
import { Type } from 'typescript';

// time
export const timeNow = () =>
  Math.floor(Date.now() / 1000);

// user
export const validUserName = (name: string) =>
  /^[a-zA-Z' -]{2,20}$/.test(name);
export const validUserPass = (pass: string) =>
  /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(pass);
export const getUserByEmail = (data: Data, email: string) =>
  data.users.find(user => email === user.email);
export const getUserById = (data: Data, id: number) =>
  data.users.find(user => id === user.userId);

// email
export const validEmail = (email: string) =>
  isEmail(email);
export const takenEmail = (data: Data, email: string) =>
  data.users.some(user => user.email === email);

// quiz
export const validQuizName = (name: string) =>
  /^[a-zA-Z0-9 ]{3,30}$/.test(name);
export const validQuizDesc = (desc: string) =>
  desc.length <= 100;
export const takenQuizName = (data: Data, uId: number, qName: string) =>
  data.quizzes.some(quiz => quiz.name === qName && quiz.userId === uId);
export const getQuizById = (data: Data, id: number) =>
  data.quizzes.find(quiz => id === quiz.quizId);
export const generateQuizId = () => {
  const data = getData();
  const random = new Random();
  let quizId: number;
  do {
    quizId = random.integer(0, Number.MAX_SAFE_INTEGER);
  }
  while (data.quizzes.find(quiz => quiz.quizId === quizId) ||
  data.trash.find(quiz => quiz.quizId === quizId));
  return quizId;
};
export const sumDuration = (quiz: Quiz) =>
  quiz.questions.reduce((sum, question) => sum + question.duration, 0);

// question
// Checks the validity of the questionBody given the questionBody
// and the quiz it will be created inside
export const validQuestionBody =
(questionBody: QuestionBody, quiz: Quiz): EmptyObject | error.ErrorObject => {
  // Check the length of the question
  if (!(validQuestion(questionBody.question))) {
    return error.invalidQuestion(questionBody.question);
  }

  // Check the number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return error.invalidNumAnswers(questionBody.answers.length);
  }

  // Check the duration
  if (questionBody.duration < 0) {
    return error.invalidDuration(questionBody.duration);
  }

  // Check the points of the question
  if (questionBody.points < 1 || questionBody.points > 10) {
    return error.invalidPoints(questionBody.points);
  }

  // Check the length of each answer
  if (questionBody.answers.find(answer => answer.answer.length < 1 ||
    answer.answer.length > 30)) {
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

// Checks if a question string is of valid length
const validQuestion = (question: string) => /^.{5,50}$/.test(question);

// Randomly generates a unique questionId
export const generateQuestionId = (quizId: number) => {
  const data = getData();
  const quiz = getQuizById(data, quizId);
  const random = new Random();
  let questionId: number;
  do {
    questionId = random.integer(0, Number.MAX_SAFE_INTEGER);
  }
  while (quiz.questions.find(question => question.questionId === questionId));
  return questionId;
};

export const getQuestionById = (quiz: Quiz, id: number) =>
  quiz.questions.find(question => id === question.questionId);
export const validNewPosition = (quiz: Quiz, position: number, currentPosition: number) =>
  (position >= 0 && position < quiz.questions.length && position !== currentPosition);

// Randomly generates an Id that is a string or a number based on the option it is given
interface TypeOptions { type: 'string' | 'number' }

export function generateId({ type }: TypeOptions | EmptyObject = {}): string | number {
  let Id;
  if (type === 'string') {
    Id = crypto.randomBytes(16).toString('base64url');
  } else {
    Id = crypto.randomBytes(4).readUInt32BE();
  }

  return Id;
}
