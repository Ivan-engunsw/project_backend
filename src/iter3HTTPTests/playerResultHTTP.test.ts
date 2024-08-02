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

describe('GET /v1/player/:playerid/results', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
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
    const resSession = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3});
    sessionId = JSON.parse(resSession.body.toString()).sessionId;
  });

  test('A playerid does not exist', () => {
    const resResults = HTTP.playerResult({playerid: 0});
    expect(JSON.parse(resResults.body.toString())).toStrictEqual(ERROR);
    expect(resResults.statusCode).toStrictEqual(400);
  });

  describe('After creating players', () => {
    let playerId1: number;
    beforeEach(() => {
        const resPlayer = HTTP.playerSessionJoin( {sessionId: sessionId, name: 'John'});
        playerId1 = JSON.parse(resPlayer.body.toString()).playerId;
    });

    test('session not in FINAL_RESULTS state', () => {
        const resResults = HTTP.playerResult({playerid: playerId1});
        expect(JSON.parse(resResults.body.toString())).toStrictEqual(ERROR);
        expect(resResults.statusCode).toStrictEqual(400);
    });

    test('returns the correct output', () => {
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'NEXT_QUESTION'});
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'SKIP_COUNTDOWN'});
        HTTP.playerQuestionAnswer({ playerid: playerId1, questionposition: 1, answerIds: [0] });
        slync(3 * 1000);
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'GO_TO_FINAL_RESULTS'});
        const resResults = HTTP.playerResult({playerid: playerId1});
        expect(JSON.parse(resResults.body.toString())).toStrictEqual({
            usersRankedByScore: [
                {
                    name: 'John',
                    score: expect.any(Number)
                }
            ],
            questionResults: [
                {
                    questionId: questionId,
                    playersCorrectList: ['John'],
                    averageAnswerTime: expect.any(Number),
                    percentCorrect: expect.any(Number)
                }
            ]
        });
    });

    test('returns the correct output with multiple questions and players', () => {
        const resPlayer2 = HTTP.playerSessionJoin( {sessionId: sessionId, name: 'Ben'});
        const playerId2 = JSON.parse(resPlayer2.body.toString()).playerId;

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
        const questionId2 = JSON.parse(resQues2.body.toString()).questionId;

        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'NEXT_QUESTION'});
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'SKIP_COUNTDOWN'});
        slync(3 * 1000);
        HTTP.playerQuestionAnswer({ playerid: playerId1, questionposition: 1, answerIds: [0]});
        HTTP.playerQuestionAnswer({ playerid: playerId2, questionposition: 1, answerIds: [0]});
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'NEXT_QUESTION'});
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'SKIP_COUNTDOWN'});
        slync(3 * 1000);
        HTTP.playerQuestionAnswer({ playerid: playerId1, questionposition: 2, answerIds: [1]});
        HTTP.playerQuestionAnswer({ playerid: playerId2, questionposition: 2, answerIds: [0]});
        HTTP.adminQuizSessionUpdate({ token: token, quizid: quizId, sessionid: sessionId, action: 'GO_TO_FINAL_RESULTS'});
        const resResults = HTTP.playerResult({playerid: playerId1});
        expect(JSON.parse(resResults.body.toString())).toStrictEqual({
            usersRankedByScore: [
              {
                name: 'Ben',
                score: expect.any(Number)
              },
              {
                name: 'John',
                score: expect.any(Number)
              }
            ],
            questionResults: [
              {
                questionId: questionId,
                playersCorrectList: ['Ben', 'John'],
                averageAnswerTime: expect.any(Number),
                percentCorrect: expect.any(Number)
              },
              {
                questionId: questionId2,
                playersCorrectList: ['Ben'],
                averageAnswerTime: expect.any(Number),
                percentCorrect: expect.any(Number)
              }
            ]
        });
    });
  });
});