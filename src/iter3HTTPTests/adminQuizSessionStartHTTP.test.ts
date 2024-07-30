import * as HTTP from './HTTPHelper';
import { State } from '../dataStore';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const INPUT_USER = {
  email: 'betty@unsw.com',
  password: 'password1',
  nameFirst: 'Betty',
  nameLast: 'Boop'
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('POST /v1/admin/quiz/:quizid/session/start', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
    const inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    const resQues = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
    questionId = JSON.parse(resQues.body.toString()).questionId;
  });

  describe('error testing', () => {
    test('returns an error for invalid autoStartNum', () => {
      const res = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 51 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz with 10 active sessions', () => {
      for (let i = 0; i < 10; i++) {
        HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      }
      const res = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz without questions', () => {
      HTTP.adminQuizQuestionDelete({ token: token, quizid: quizId, questionid: questionId });

      const res = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a quiz in the trash', () => {
      HTTP.adminQuizRemove({ token: token, quizid: quizId });

      const res = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid token', () => {
      const res = HTTP.adminQuizSessionStart({ token: token + 1, quizid: quizId, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizId', () => {
      const res = HTTP.adminQuizSessionStart({ token: token, quizid: quizId + 1, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for unauthorised access', () => {
      const resUser2 = HTTP.adminAuthRegister({
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;

      const res = HTTP.adminQuizSessionStart({ token: token2, quizid: quizId, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      expect(JSON.parse(res.body.toString())).toHaveProperty('sessionId', expect.any(Number));
    });

    test.skip('correctly creates the session', () => {
      const start = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      const sessionId = JSON.parse(start.body.toString()).sessionId;

      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(res.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.LOBBY);
      expect(sessionInfo).toHaveProperty('atQuestion', 0);
      expect(sessionInfo).toHaveProperty('players', []);
      expect(sessionInfo).toHaveProperty('metadata.quizId', quizId);
    });

    test.skip('session correctly autostarts', () => {
      const start = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 1 });
      const sessionId = JSON.parse(start.body.toString()).sessionId;
      HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });

      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(res.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.QUESTION_COUNTDOWN);
      expect(sessionInfo).toHaveProperty('atQuestion', 1);
      expect(sessionInfo).toHaveProperty('players', ['Betty']);
      expect(sessionInfo).toHaveProperty('metadata.quizId', quizId);
    });

    test('session doesn\'t autostart', () => {
      const start = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 0 });
      const sessionId = JSON.parse(start.body.toString()).sessionId;
      HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });

      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(res.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.LOBBY);
      expect(sessionInfo).toHaveProperty('atQuestion', 0);
      expect(sessionInfo).toHaveProperty('players', ['Betty']);
      expect(sessionInfo).toHaveProperty('metadata.quizId', quizId);
    });
  });
});
