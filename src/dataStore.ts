export type EmptyObject = Record < string, never >;
import fs from 'fs';

export interface User {
  userId: number;
  name: string;
  email: string;
  password: string;
  oldPwords ? : string[];
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
  numQuestions: number;
  questions: Question[];
  duration: number;
  thumbnailUrl ? : string;
}

export interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  thumbnailUrl ? : string;
}

export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface Token {
  tokenId: string;
  authUserId: number;
}

export interface Data {
  users: User[];
  quizzes: Quiz[];
  tokens: Token[];
  trash: Quiz[];
}

let data: Data = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: []
};

// Use get() to access the data
export function getData(): Data {
  if (fs.existsSync('src/dataStoreSave.json')) {
    data = JSON.parse(fs.readFileSync('src/dataStoreSave.json', {
      flag: 'r'
    }).toString());
  }
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: Data) {
  data = newData;
  fs.writeFileSync('src/dataStoreSave.json', JSON.stringify(data), {
    flag: 'w'
  });
}
