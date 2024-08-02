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

describe('GET /v1/player/{playerid}', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;
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

    const resPlayer = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Betty' });
    playerId = JSON.parse(resPlayer.body.toString()).playerId;
  });

  describe('error testing', () => {
    test('returns an error for an invalid player ID', () => {
      const res = HTTP.playerStatus({ playerid: playerId + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a player not in any session', () => {
      const res = HTTP.playerStatus({ playerid: playerId });
      HTTP.playerLeaveSession({ playerid: playerId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.playerStatus({ playerid: playerId });
      const response = JSON.parse(res.body.toString());
      expect(response).toHaveProperty('state', expect.any(String));
      expect(response).toHaveProperty('numQuestions', expect.any(Number));
      expect(response).toHaveProperty('atQuestion', expect.any(Number));
    });

    test('returns the correct state and question info', () => {
      const res = HTTP.playerStatus({ playerid: playerId });
      const response = JSON.parse(res.body.toString());
      expect(response.state).toBe('LOBBY');
      expect(response.numQuestions).toBe(1); // Assuming 1 question added in the setup
      expect(response.atQuestion).toBe(0);
    });

    test('updates the state and question info as the quiz progresses', () => {
      // Advance the session to the first question
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.NEXT });
      let res = HTTP.playerStatus({ playerid: playerId });
      let response = JSON.parse(res.body.toString());
      expect(response.state).toBe('IN_PROGRESS');
      expect(response.numQuestions).toBe(1); // Assuming 1 question added in the setup
      expect(response.atQuestion).toBe(1);

      // End the session
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });
      res = HTTP.playerStatus({ playerid: playerId });
      response = JSON.parse(res.body.toString());
      expect(response.state).toBe('END');
      expect(response.atQuestion).toBe(0);
    });
  });
});
