import * as HTTP from './HTTPHelper';
import { QuestionBody } from '../quiz';

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

describe('POST /v2/admin/quiz/{quizid}/question', () => {
  let token: string;
  let quizId: number;
  let inputQuestion: QuestionBody;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;

    inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{
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
  });

  describe('error testing', () => {
    test('returns an error for invalid question length', () => {
      inputQuestion.question = 'Uh?';
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.question =
      'Sometimes I wonder what question I\'m even ' +
      'asking like is there even any point to asking this?';
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid number of answers', () => {
      inputQuestion.answers = [{
        answer: 'Prince Charles',
        correct: true
      }];
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.answers = [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        },
        {
          answer: 'Mary II',
          correct: false
        },
        {
          answer: 'Charles II',
          correct: false
        },
        {
          answer: 'King Arthur',
          correct: false
        },
        {
          answer: 'Henry VIII',
          correct: false
        },
        {
          answer: 'Edward VI',
          correct: true
        },
      ];
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid duration', () => {
      inputQuestion.duration = -1;
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.duration = 0;
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid points', () => {
      inputQuestion.points = 0;
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.points = 49;
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid answer length', () => {
      inputQuestion.answers = [{
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Prince Charles Junior Knight The Fourth Knave',
        correct: false
      },
      ];
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.answers = [{
        answer: '',
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      },
      ];
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('returns an error for duplicate answers', () => {
      inputQuestion.answers = [{
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Prince Charles',
        correct: false
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      },
      ];
      const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when there are no correct answers', () => {
      inputQuestion.answers = [{
        answer: 'Prince Charles',
        correct: false
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      },
      ];
      const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when question duration exceeds 3 minutes', () => {
      inputQuestion.duration = 181;
      const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error when question causes quiz duration to exceed 3 minutes', () => {
      HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      const questionBody: QuestionBody = {
        question: 'Why is English food so bad?',
        duration: 177,
        points: 5,
        answers: [{
          answer: 'Because they have no culture',
          correct: true
        },
        {
          answer: 'I\'m not sure',
          correct: false
        },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: questionBody });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid thumbnail', () => {
      inputQuestion.thumbnailUrl = '';
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputQuestion.thumbnailUrl = 'http://google.com/some/image/path';
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);

      inputQuestion.thumbnailUrl = 'google.com/some/image/path.jpg';
      const res3 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res3.body.toString())).toStrictEqual(ERROR);
      expect(res3.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid token', () => {
      const res = HTTP.adminQuizQuestionCreate({ token: token + 1, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for an invalid quizId', () => {
      const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId + 1, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for an quiz not owned by the user', () => {
      const resUser2 = HTTP.adminAuthRegister({
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile'
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;
      const res = HTTP.adminQuizQuestionCreate({ token: token2, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        questionId: expect.any(Number)
      });
    });

    test('accepts multiple thumbnail formats', () => {
      inputQuestion.thumbnailUrl = 'http://google.com/some/image/path.png';
      const res1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({
        questionId: expect.any(Number)
      });

      inputQuestion.thumbnailUrl = 'http://google.com/some/image/path.jpeg';
      const res2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({
        questionId: expect.any(Number)
      });

      inputQuestion.thumbnailUrl = 'https://google.com/some/image/path.jpg';
      const res3 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      expect(JSON.parse(res3.body.toString())).toStrictEqual({
        questionId: expect.any(Number)
      });
    });

    test('correctly creates a question', () => {
      const resQues = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      const questionId = JSON.parse(resQues.body.toString()).questionId;
      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const quizInfo = JSON.parse(res.body.toString());
      expect(quizInfo.numQuestions).toStrictEqual(1);
      expect(quizInfo.questions).toStrictEqual([{
        questionId: questionId,
        question: inputQuestion.question,
        duration: inputQuestion.duration,
        points: inputQuestion.points,
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
      }]);
      expect(quizInfo.duration).toStrictEqual(inputQuestion.duration);
    });

    test('correctly creates multiple questions', () => {
      const resQues1 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
      const questionId1 = JSON.parse(resQues1.body.toString()).questionId;

      const questionBody = {
        question: 'Why is English food so bad?',
        duration: 11,
        points: 5,
        answers: [{
          answer: 'Because they have no culture',
          correct: true,
        },
        {
          answer: 'I\'m not sure',
          correct: false,
        },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      const resQues2 = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: questionBody });
      const questionId2 = JSON.parse(resQues2.body.toString()).questionId;
      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const quizInfo = JSON.parse(res.body.toString());
      expect(quizInfo.numQuestions).toStrictEqual(2);
      expect(quizInfo.questions).toStrictEqual([{
        questionId: questionId1,
        question: inputQuestion.question,
        duration: inputQuestion.duration,
        points: inputQuestion.points,
        answers: [{
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
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      },
      {
        questionId: questionId2,
        question: questionBody.question,
        duration: questionBody.duration,
        points: questionBody.points,
        answers: [{
          answerId: expect.any(Number),
          answer: 'Because they have no culture',
          colour: expect.any(String),
          correct: true,
        },
        {
          answerId: expect.any(Number),
          answer: 'I\'m not sure',
          colour: expect.any(String),
          correct: false,
        },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      },
      ]);
      expect(quizInfo.duration).toStrictEqual(inputQuestion.duration + questionBody.duration);
    });
  });
});
