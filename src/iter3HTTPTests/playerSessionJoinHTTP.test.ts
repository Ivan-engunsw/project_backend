import { Action } from '../dataStore';
import * as HTTP from './HTTPHelper';

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

describe('POST /v1/player/join', () => {
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
    HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
    const session = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
    sessionId = JSON.parse(session.body.toString()).sessionId;
  });

  describe('error testing', () => {
    test('name already exists in the session', () => {
      HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
      const res = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid sessionId', () => {
      const res = HTTP.playerSessionJoin({ sessionId: sessionId + 1, name: 'Betty' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test.skip('returns an error for a session not in LOBBY state', () => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });
      const res = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    describe('functionality testing', () => {
      test('has the correct return type', () => {
        const res = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
        expect(JSON.parse(res.body.toString())).toHaveProperty('playerId', expect.any(Number));
      });

      test.skip('player to successfully joins the session', () => {
        HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
        const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        expect(JSON.parse(res.body.toString()).players).toContain('Betty');
      });

      test.skip('generates a random name for an empty string', () => {
        HTTP.playerSessionJoin({ sessionId: sessionId, name: '' });
        const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId });
        expect(JSON.parse(res.body.toString())).toHaveProperty('players', [expect.any(String)]);
      });
    });
  });
});
