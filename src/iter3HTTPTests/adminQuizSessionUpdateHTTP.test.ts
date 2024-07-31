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
      duration: 5,
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
    test('returns an error for a sessionId that isn\'t for the quiz', () => {
      const res = HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId + 1, action: Action.END });
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

      slync(5 * 1000);
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

    describe.skip('tests to skip', () => {
      test('correctly updates a session to QUESTION_COUNTDOWN', () => {
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
        const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        const sessionInfo = JSON.parse(resInfo.body.toString());
        expect(sessionInfo).toHaveProperty('state', State.QUESTION_COUNTDOWN);
      });

      test('correctly updates a session to QUESTION_OPEN', () => {
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
        const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        const sessionInfo = JSON.parse(resInfo.body.toString());
        expect(sessionInfo).toHaveProperty('state', State.QUESTION_OPEN);
      });

      test('correctly updates a session to ANSWER_SHOW', () => {
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_ANSWER });
        const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        const sessionInfo = JSON.parse(resInfo.body.toString());
        expect(sessionInfo).toHaveProperty('state', State.ANSWER_SHOW);
      });

      test('correctly updates a session to FINAL_RESULTS', () => {
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_ANSWER });
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.GO_TO_FINAL_RESULTS });
        const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        const sessionInfo = JSON.parse(resInfo.body.toString());
        expect(sessionInfo).toHaveProperty('state', State.FINAL_RESULTS);
      });

      test('correctly updates a session to END', () => {
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });
        const resInfo = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        const sessionInfo = JSON.parse(resInfo.body.toString());
        expect(sessionInfo).toHaveProperty('state', State.END);
      });
    });
  });
});
