import { Action } from '../dataStore';
import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const USER1 = {
  email: 'auth@one.com',
  password: 'authone1',
  nameFirst: 'auth',
  nameLast: 'one'
};

const USER2 = {
  email: 'auth@two.com',
  password: 'authtwo2',
  nameFirst: 'auth',
  nameLast: 'two'
};

const QUEST = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth', correct: false },
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('/v1/admin/quiz/{quizid}/sessions', () => {
  let token1: string;
  let token2: string;
  let quizId: number;
  let seshId1: number;
  let seshId2: number;
  let seshId3: number;
  let seshId4: number;
  beforeEach(() => {
    const resUser1 = HTTP.adminAuthRegister(USER1);
    token1 = JSON.parse(resUser1.body.toString()).token;

    const resUser2 = HTTP.adminAuthRegister(USER2);
    token2 = JSON.parse(resUser2.body.toString()).token;

    const resQuiz = HTTP.adminQuizCreate({
      token: token1,
      name: 'first',
      description: 'desc'
    });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;

    HTTP.adminQuizQuestionCreate({
      token: token1,
      quizid: quizId,
      questionBody: QUEST
    });

    const resSesh1 = HTTP.adminQuizSessionStart({
      token: token1,
      quizid: quizId,
      autoStartNum: 3
    });
    seshId1 = JSON.parse(resSesh1.body.toString()).sessionId;

    const resSesh2 = HTTP.adminQuizSessionStart({
      token: token1,
      quizid: quizId,
      autoStartNum: 4
    });
    seshId2 = JSON.parse(resSesh2.body.toString()).sessionId;

    const resSesh3 = HTTP.adminQuizSessionStart({
      token: token1,
      quizid: quizId,
      autoStartNum: 5
    });
    seshId3 = JSON.parse(resSesh3.body.toString()).sessionId;

    const resSesh4 = HTTP.adminQuizSessionStart({
      token: token1,
      quizid: quizId,
      autoStartNum: 6
    });
    seshId4 = JSON.parse(resSesh4.body.toString()).sessionId;

    HTTP.playerSessionJoin({
      sessionId: seshId1,
      name: 'john'
    });

    HTTP.playerSessionJoin({
      sessionId: seshId2,
      name: 'bill'
    });

    HTTP.playerSessionJoin({
      sessionId: seshId3,
      name: 'adam'
    });

    HTTP.playerSessionJoin({
      sessionId: seshId4,
      name: 'kate'
    });

    HTTP.adminQuizSessionUpdate({
      token: token1,
      quizid: quizId,
      sessionid: seshId1,
      action: Action.END
    });

    HTTP.adminQuizSessionUpdate({
      token: token1,
      quizid: quizId,
      sessionid: seshId3,
      action: Action.END
    });

    describe('Error testing', () => {
      test('invalid token', () => {
        const res = HTTP.adminQuizSessionsList({ token: token1 + 1, quizid: quizId });
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(401);
      });

      test('invalid quizId', () => {
        const res = HTTP.adminQuizSessionsList({ token: token1, quizid: quizId + 1 });
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
      });

      test('unauthorised access', () => {
        const res = HTTP.adminQuizSessionsList({ token: token2, quizid: quizId });
        expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
        expect(res.statusCode).toStrictEqual(403);
      });
    });

    describe('Functionality testing', () => {
      test('correctly returns sessions', () => {
        const res = HTTP.adminQuizSessionsList({ token: token1, quizid: quizId });
        expect(JSON.parse(res.body.toString())).toStrictEqual({
          activeSessions: [seshId2, seshId4],
          inactiveSessions: [seshId1, seshId3]
        });
      });
    });
  });
});
