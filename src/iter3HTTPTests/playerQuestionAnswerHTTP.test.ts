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
const QUEST1 = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth', correct: false },
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg',
};

const QUEST2 = {
  question: 'Who is the current Bishop of England?',
  duration: 9,
  points: 7,
  answers: [
    { answer: 'Bloody Mary', correct: true },
    { answer: 'Queen Elizabeth', correct: false }
  ],
  thumbnailUrl: 'http://baidu.com/new/picture/road.jpg',
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('PUT /v1/player/:playerid/question/:questionposition/answer', () => {
  let token1: string;
  let quizId1: number;
  let seshId1: number;
  let playerId1: number;

  beforeEach(() => {
    const resUser1 = HTTP.adminAuthRegister(USER1);
    token1 = JSON.parse(resUser1.body.toString()).token;

    const resQuiz1 = HTTP.adminQuizCreate({
      token: token1,
      name: 'first',
      description: 'desc'
    });
    quizId1 = JSON.parse(resQuiz1.body.toString()).quizId;

    HTTP.adminQuizQuestionCreate({
      token: token1,
      quizid: quizId1,
      questionBody: QUEST1
    });

    HTTP.adminQuizQuestionCreate({
      token: token1,
      quizid: quizId1,
      questionBody: QUEST2
    });

    const resSesh1 = HTTP.adminQuizSessionStart({
      token: token1,
      quizid: quizId1,
      autoStartNum: 5
    });
    seshId1 = JSON.parse(resSesh1.body.toString()).sessionId;

    const resPlayer1 = HTTP.playerSessionJoin({
      sessionId: seshId1,
      name: 'john'
    });
    playerId1 = JSON.parse(resPlayer1.body.toString()).playerId;

    HTTP.adminQuizSessionUpdate({
      token: token1,
      quizid: quizId1,
      sessionid: seshId1,
      action: Action.NEXT_QUESTION
    });

    HTTP.adminQuizSessionUpdate({
      token: token1,
      quizid: quizId1,
      sessionid: seshId1,
      action: Action.SKIP_COUNTDOWN
    });
  });

  describe('Error Testing', () => {
    test('player ID does not exist', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1 + 1,
        questionposition: 1,
        answerIds: [0]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('question position is not valid for the session this player is in', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 3,
        answerIds: [0]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('session is not in QUESTION_OPEN state', () => {
      HTTP.adminQuizSessionUpdate({
        token: token1,
        quizid: quizId1,
        sessionid: seshId1,
        action: Action.GO_TO_ANSWER
      });

      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 1,
        answerIds: [0]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('session is not currently on this question', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 2,
        answerIds: [0]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('answer IDs are not valid for this particular question', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 1,
        answerIds: [3]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('duplicate answer IDs provided', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 1,
        answerIds: [0, 0]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('less than 1 answer ID submitted', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 1,
        answerIds: []
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Functionality Testing', () => {
    test('correct return type', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 1,
        answerIds: [0]
      });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test.skip('correctly updates answer ids', () => {
      const res = HTTP.playerQuestionAnswer({
        playerid: playerId1,
        questionposition: 1,
        answerIds: [0]
      });
      expect(JSON.parse(res.body.toString())).not.toStrictEqual(ERROR);

      HTTP.adminQuizSessionUpdate({
        token: token1,
        quizid: quizId1,
        sessionid: seshId1,
        action: 'QUESTION_CLOSE'
      });

      const resResults = HTTP.playerQuestionResult({
        playerid: playerId1,
        questionposition: 1
      });
      const results1 = JSON.parse(resResults.body.toString());
      expect(results1.playersCorrectList).toStrictEqual([0]);
    });
  });
});
