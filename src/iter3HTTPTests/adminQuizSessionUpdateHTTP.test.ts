import * as HTTP from './HTTPHelper';
import { State, Action } from '../dataStore';
import slync from 'slync';

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

describe('PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
    const inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 1,
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
    HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
    const start = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
    sessionId = JSON.parse(start.body.toString()).sessionId;
  });

  describe('error testing', () => {
    test('returns an error for an invalid sessionId', () => {
      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId + 1, action: Action.END });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('retusn an error for a sessionId that doesn\'t match the quizId', () => {
      const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'Quiz2', description: 'Betty\'s quiz' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId2, sessionid: sessionId, action: Action.END });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an action that isn\'t valid', () => {
      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'PLEASE_FINISH' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
    ])('returns an error for an action that cannot be done while in LOBBY state', (action) => {
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.LOBBY);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
    ])('returns an error for an action that cannot be done while in QUESTION_COUNTDOWN state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.QUESTION_COUNTDOWN);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_FINAL_RESULTS,
    ])('returns an error for an action that cannot be done while in QUESTION_OPEN state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.QUESTION_OPEN);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.SKIP_COUNTDOWN,
    ])('returns an error for an action that cannot be done while in QUESTION_CLOSE state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });

      slync(1 * 1000);
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.QUESTION_CLOSE);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
    ])('returns an error for an action that cannot be done while in ANSWER_SHOW state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_ANSWER });
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.ANSWER_SHOW);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
    ])('returns an error for an action that cannot be done while in FINAL_RESULTS state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_ANSWER });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_FINAL_RESULTS });
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.FINAL_RESULTS);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
      Action.END,
    ])('returns an error for an action that cannot be done while in END state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });
      const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionInfo = JSON.parse(resInfo.body.toString());
      expect(sessionInfo).toHaveProperty('state', State.END);

      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid token', () => {
      const res = HTTP.adminQuizSessionUpdate({ token: token + 1, quizid: quizId, sessionid: sessionId, action: Action.END });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizid', () => {
      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId + 1, sessionid: sessionId, action: Action.END });
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

      const res = HTTP.adminQuizSessionUpdate({ token: token2, quizid: quizId, sessionid: sessionId, action: Action.END });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('session automatically moves into QUESTION_OPEN', () => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });

      slync(3 * 1000);
      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      const sessionStatus = JSON.parse(res.body.toString());
      expect(sessionStatus).toHaveProperty('state', State.QUESTION_OPEN);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.END
    ])('session correctly updates from LOBBY state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      let res;
      switch (action) {
        case Action.NEXT_QUESTION:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.QUESTION_COUNTDOWN);
          break;
        case Action.END:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.END);
          break;
      }
    });

    test.each([
      Action.SKIP_COUNTDOWN,
      Action.END
    ])('session correctly updates from QUESTION_COUNTDOWN state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      let res;
      switch (action) {
        case Action.SKIP_COUNTDOWN:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.QUESTION_OPEN);
          break;
        case Action.END:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.END);
          break;
      }
    });

    test.each([
      Action.GO_TO_ANSWER,
      Action.END
    ])('session correctly updates from QUESTION_OPEN state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      let res;
      switch (action) {
        case Action.GO_TO_ANSWER:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.ANSWER_SHOW);
          break;
        case Action.END:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.END);
          break;
      }
    });

    test('session automatically moves into QUESTION_CLOSE state', () => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });

      const res1 = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      expect(JSON.parse(res1.body.toString())).toHaveProperty('state', State.QUESTION_OPEN);

      slync(2 * 1000);
      const res2 = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      expect(JSON.parse(res2.body.toString())).toHaveProperty('state', State.QUESTION_CLOSE);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
      Action.END
    ])('session correctly updates from QUESTION_CLOSE state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });

      slync(1 * 1000);
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      let res;
      switch (action) {
        case Action.NEXT_QUESTION:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.QUESTION_COUNTDOWN);
          break;
        case Action.GO_TO_ANSWER:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.ANSWER_SHOW);
          break;
        case Action.GO_TO_FINAL_RESULTS:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.FINAL_RESULTS);
          break;
        case Action.END:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.END);
          break;
      }
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.GO_TO_FINAL_RESULTS,
      Action.END,
    ])('session correctly updates from ANSWER_SHOW state', (action) => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_ANSWER });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: action });
      let res;
      switch (action) {
        case Action.NEXT_QUESTION:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.QUESTION_COUNTDOWN);
          break;
        case Action.GO_TO_FINAL_RESULTS:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.FINAL_RESULTS);
          break;
        case Action.END:
          res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
          expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.END);
          break;
      }
    });

    test('session correctly updates from FINAL_RESULTS state', () => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_ANSWER });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_FINAL_RESULTS });

      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });
      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
      expect(JSON.parse(res.body.toString())).toHaveProperty('state', State.END);
    });
  });
});
