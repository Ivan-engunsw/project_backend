import { Action, State } from '../dataStore';
import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const stateToAction: { [key in State]: Action } = {
  [State.LOBBY]: Action.OPEN_QUESTION,
  [State.QUESTION_COUNTDOWN]: Action.SKIP_COUNTDOWN,
  [State.QUESTION_OPEN]: Action.OPEN_QUESTION,
  [State.QUESTION_CLOSE]: Action.CLOSE_QUESTION,
  [State.ANSWER_SHOW]: Action.GO_TO_ANSWER,
  [State.FINAL_RESULTS]: Action.GO_TO_FINAL_RESULTS,
  [State.END]: Action.END,
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
      const res = HTTP.playerSessionStatus({ playerid: playerId + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for a player not in a session', () => {
      // End the session
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: Action.END });

      const res = HTTP.playerSessionStatus({ playerid: playerId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.playerSessionStatus({ playerid: playerId });
      const result = JSON.parse(res.body.toString());
      expect(result).toHaveProperty('state', expect.any(String));
      expect(result).toHaveProperty('numQuestions', expect.any(Number));
      expect(result).toHaveProperty('atQuestion', expect.any(Number));
    });

    test('returns correct player status in different session states', () => {
      const states = [
        State.LOBBY,
        State.QUESTION_COUNTDOWN,
        State.QUESTION_OPEN,
        State.QUESTION_CLOSE,
        State.ANSWER_SHOW,
        State.FINAL_RESULTS,
        State.END
      ];

      states.forEach(state => {
        // Set session state
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: stateToAction[state] });

        const res = HTTP.playerSessionStatus({ playerid: playerId });
        const result = JSON.parse(res.body.toString());

        expect(result).toHaveProperty('state', state);
        expect(result).toHaveProperty('numQuestions', 1); // assuming there is 1 question
        expect(result).toHaveProperty('atQuestion', [State.LOBBY, State.FINAL_RESULTS, State.END].includes(state) ? 0 : 1); // assuming the current question is 1
      });
    });
  });
});
