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

export interface Session {
  sessionId: number;
  autoStartNum: number;
  state: State;
  atQuestion: number;
  players: Player[];
  metadata: Omit<Quiz, 'userId'>;
  questionResults: QuestionResult[];
  usersRankedByScore: UserScore[];
  messages: Message[];
}

export interface Player {
  playerId: number;
  name: string;
}

export interface QuestionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
  submissions: Submission[];
  scores: UserScore[];
}

export interface Submission {
  name: string;
  answers: number[];
  timeSubmitted: number;
}

export interface UserScore {
  name: string;
  score: number;
}

export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export enum State {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
  OPEN_QUESTION = 'OPEN_QUESTION',
  CLOSE_QUESTION = 'CLOSE_QUESTION',
}

export interface Data {
  users: User[];
  quizzes: Quiz[];
  tokens: Token[];
  trash: Quiz[];
  sessions: Session[];
}

let data: Data = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: [],
  sessions: [],
};

const sessionIdtoTimerMap: Map<number, ReturnType<typeof setTimeout>> = new Map();

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

export function clearMap() {
  sessionIdtoTimerMap.forEach((timeout, sessionId) => {
    clearTimeout(timeout);
    sessionIdtoTimerMap.delete(sessionId);
  });
}

export function mapSet(sessionId: number, timeoutId: ReturnType<typeof setTimeout>) {
  sessionIdtoTimerMap.set(sessionId, timeoutId);
}

export function mapDelete(sessionId: number) {
  const timeoutId = sessionIdtoTimerMap.get(sessionId);
  clearTimeout(timeoutId);
  sessionIdtoTimerMap.delete(sessionId);
}
