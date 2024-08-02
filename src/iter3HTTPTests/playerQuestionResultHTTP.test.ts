import * as HTTP from './HTTPHelper';
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

describe('GET /v1/player/:playerid/question/:questionposition/results', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  let questionId2: number;
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
    const resQues = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
    questionId = JSON.parse(resQues.body.toString()).questionId;
    const inputQuestion2 = {
      question: 'Who is Ronaldo?',
      duration: 1,
      points: 3,
      answers: [
        {
          answer: 'A football player',
          correct: true
        },
        {
          answer: 'A dancer',
          correct: false
        },
      ],
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
    };
    const resQues2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion2 });
    questionId2 = JSON.parse(resQues2.body.toString()).questionId;
    const resSession = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
    sessionId = JSON.parse(resSession.body.toString()).sessionId;
  });

  test('A playerid does not exist', () => {
    const resResults = HTTP.playerQuestionResult({ playerid: 0, questionposition: 1 });
    expect(JSON.parse(resResults.body.toString())).toStrictEqual(ERROR);
    expect(resResults.statusCode).toStrictEqual(400);
  });

  describe('After creating players', () => {
    let playerId1: number;
    beforeEach(() => {
      const resPlayer = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'John' });
      playerId1 = JSON.parse(resPlayer.body.toString()).playerId;
    });

    test('session not in ANSWER_SHOW state', () => {
      const resResults = HTTP.playerQuestionResult({ playerid: playerId1, questionposition: 1 });
      expect(JSON.parse(resResults.body.toString())).toStrictEqual(ERROR);
      expect(resResults.statusCode).toStrictEqual(400);
    });

    test('question position is not valid for this session', () => {
      const resResults = HTTP.playerQuestionResult({ playerid: playerId1, questionposition: 100 });
      expect(JSON.parse(resResults.body.toString())).toStrictEqual(ERROR);
      expect(resResults.statusCode).toStrictEqual(400);
    });

    test('session not currently on this question', () => {
      const resResults = HTTP.playerQuestionResult({ playerid: playerId1, questionposition: 2 });
      expect(JSON.parse(resResults.body.toString())).toStrictEqual(ERROR);
      expect(resResults.statusCode).toStrictEqual(400);
    });

    test('returns the correct output', () => {
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'NEXT_QUESTION' });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'SKIP_COUNTDOWN' });
      HTTP.playerQuestionAnswer({ playerid: playerId1, questionposition: 1, answerIds: [0] });
      slync(1 * 1000);
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'GO_TO_ANSWER' });
      const resResults = HTTP.playerQuestionResult({ playerid: playerId1, questionposition: 1});
      expect(JSON.parse(resResults.body.toString())).toStrictEqual({
          questionId: questionId,
          playersCorrectList: ['John'],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
      });
    });

    test('returns the correct output with multiple questions and players', () => {
      const resPlayer2 = HTTP.playerSessionJoin({ sessionId: sessionId, name: 'Ben' });
      const playerId2 = JSON.parse(resPlayer2.body.toString()).playerId;

      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'NEXT_QUESTION' });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'SKIP_COUNTDOWN' });
      HTTP.playerQuestionAnswer({ playerid: playerId1, questionposition: 1, answerIds: [0] });
      HTTP.playerQuestionAnswer({ playerid: playerId2, questionposition: 1, answerIds: [0] });
      slync(1 * 1000);
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'NEXT_QUESTION' });
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'SKIP_COUNTDOWN' });
      HTTP.playerQuestionAnswer({ playerid: playerId1, questionposition: 2, answerIds: [1] });
      HTTP.playerQuestionAnswer({ playerid: playerId2, questionposition: 2, answerIds: [0] });
      slync(1 * 1000);
      HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'GO_TO_ANSWER' });
      const resResults1 = HTTP.playerQuestionResult({ playerid: playerId1, questionposition: 1});
      expect(JSON.parse(resResults1.body.toString())).toStrictEqual({
          questionId: questionId,
          playersCorrectList: ['Ben', 'John'],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
      });
      const resResults2 = HTTP.playerQuestionResult({ playerid: playerId1, questionposition: 2});
      expect(JSON.parse(resResults2.body.toString())).toStrictEqual({
          questionId: questionId2,
          playersCorrectList: ['Ben'],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
      });
    });
  });
});
