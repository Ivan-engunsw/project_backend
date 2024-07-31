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
    const start = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
    sessionId = JSON.parse(start.body.toString()).sessionId;
  });

  describe('error testing', () => {
    test('returns an error for an invalid sessionId', () => {
      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('retusn an error for a sessionId that doesn\'t match the quizId', () => {
      const resQuiz2 = HTTP.adminQuizCreate({ token: token, name: 'Quiz2', description: 'Betty\'s quiz' });
      const quizId2 = JSON.parse(resQuiz2.body.toString()).quizId;

      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId2, sessionid: sessionId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid token', () => {
      const res = HTTP.adminQuizSessionStatus({ token: token + 1, quizid: quizId, sessionid: sessionId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizid', () => {
      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId + 1, sessionid: sessionId });
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

      const res = HTTP.adminQuizSessionStatus({ token: token2, quizid: quizId, sessionid: sessionId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });
      const start = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
      const sessionId2 = JSON.parse(start.body.toString()).sessionId;

      const res = HTTP.adminQuizSessionStatus({ token: token, quizid: quizId, sessionid: sessionId2 });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        state: State.LOBBY,
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: quizId,
          name: 'Quiz1',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Betty\'s quiz',
          numQuestions: 1,
          questions: [
            {
              questionId: expect.any(Number),
              question: 'Who is the Monarch of England?',
              duration: 10,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Queen Elizabeth',
                  colour: expect.any(String),
                  correct: false,
                },
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg',
            }
          ],
          duration: 10,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
        }
      });
    });
  });
});
