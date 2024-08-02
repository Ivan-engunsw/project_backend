import { Action, State } from '../dataStore';
import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('GET /v1/player/{playerid}/question/{questionposition}', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;

  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister({ email: 'betty@unsw.com', password: 'password1', nameFirst: 'Betty', nameLast: 'Boop' });
    token = JSON.parse(resUser.body.toString()).token;

    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;

    const inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };

    HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });

    const session = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
    sessionId = JSON.parse(session.body.toString()).sessionId;

    const resJoin = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
    playerId = JSON.parse(resJoin.body.toString()).playerId;
  });

  describe('error testing', () => {
    test('returns an error for an invalid playerId', () => {
      const res = HTTP.playerQuestionInfo({ playerid: playerId + 1, questionposition: 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid question position', () => {
      const res = HTTP.playerQuestionInfo({ playerid: playerId, questionposition: 0 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error if session is in an invalid state', () => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });

      const res = HTTP.playerQuestionInfo({ playerid: playerId, questionposition: 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('functionality testing', () => {
    test('returns correct question info for valid request', () => {
      // Move session to QUESTION_OPEN state
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT_QUESTION });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.SKIP_COUNTDOWN });

      const res = HTTP.playerQuestionInfo({ playerid: playerId, questionposition: 1 });
      const result = JSON.parse(res.body.toString());

      expect(result).toHaveProperty('questionId', expect.any(Number));
      expect(result).toHaveProperty('question', expect.any(String));
      expect(result).toHaveProperty('duration', expect.any(Number));
      expect(result).toHaveProperty('thumbnailUrl', expect.any(String));
      expect(result).toHaveProperty('points', expect.any(Number));
      expect(result).toHaveProperty('answers', expect.any(Array));
    });
  });
});
