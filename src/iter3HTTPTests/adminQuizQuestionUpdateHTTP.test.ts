import * as HTTP from './HTTPHelper';
import { timeNow } from '../helper';
import { QuestionBody } from '../quiz';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const INPUT_USER = {
  email: 'bettyBoop@gmail.com',
  password: 'helloWorld1',
  nameFirst: 'Betty',
  nameLast: 'Boop',
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('PUT /v2/admin/quiz/:quizid/question/:questionId', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  let inputUpdate: QuestionBody;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Sample Quiz', description: 'For testing purposes quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;

    const inputQuestion = {
      question: 'Who is the Monarch of England?',
      duration: 4,
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
    const res = HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });
    questionId = JSON.parse(res.body.toString()).questionId;

    inputUpdate = {
      question: 'Who is the current Bishop of England?',
      duration: 9,
      points: 7,
      answers: [
        {
          answer: 'Bloody Mary',
          correct: true
        },
        {
          answer: 'King Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'http://baidu.com/new/picture/road.jpg',
    };
  });

  describe('functionality testing', () => {
    test('Successfully updates the question', () => {
      const time = timeNow();
      const res = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});

      const resQuiz = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const updatedQuestion = JSON.parse(resQuiz.body.toString()).questions;
      expect(updatedQuestion).toStrictEqual([{
        questionId: questionId,
        question: 'Who is the current Bishop of England?',
        duration: 9,
        points: 7,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Bloody Mary',
            colour: expect.any(String),
            correct: true,
          },
          {
            answerId: expect.any(Number),
            answer: 'King Elizabeth',
            colour: expect.any(String),
            correct: false,
          },
        ],
        thumbnailUrl: 'http://baidu.com/new/picture/road.jpg',
      }]);
      expect(JSON.parse(resQuiz.body.toString()).timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(JSON.parse(resQuiz.body.toString()).timeLastEdited).toBeLessThanOrEqual(time + 1);
      expect(JSON.parse(resQuiz.body.toString()).duration).toStrictEqual(inputUpdate.duration);
    });

    test('accepts multiple thumbnail formats', () => {
      inputUpdate.thumbnailUrl = 'http://baidu.com/new/picture/road.png';
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({});

      inputUpdate.thumbnailUrl = 'http://baidu.com/new/picture/road.jpeg';
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual({});

      inputUpdate.thumbnailUrl = 'https://baidu.com/new/picture/road.jpg';
      const res3 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res3.body.toString())).toStrictEqual({});
    });
  });

  describe('Error Testing', () => {
    test('Case when token is invalid', () => {
      const res = HTTP.adminQuizQuestionUpdate({ token: token + 1, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when question ID is invalid', () => {
      const res = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId + 1, questionBody: inputUpdate });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when question is too short or too long', () => {
      inputUpdate.question = 'Too';
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputUpdate.question = 'A'.repeat(51);
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when there are too few or too many answers', () => {
      inputUpdate.answers = [{
        answer: 'Prince Charles',
        correct: true
      }];
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputUpdate.answers = [{
        answer: 'Answer 1',
        correct: false
      },
      {
        answer: 'Answer 2',
        correct: false
      },
      {
        answer: 'Answer 3',
        correct: false
      },
      {
        answer: 'Answer 4',
        correct: false
      },
      {
        answer: 'Answer 5',
        correct: false
      },
      {
        answer: 'Answer 6',
        correct: true
      },
      {
        answer: 'Answer 7',
        correct: false
      }
      ];
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when duration is not a positive number or exceeds total duration', () => {
      inputUpdate.duration = 0;
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputUpdate.duration = 181;
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when updated duration causes quiz to exceed 3 mins', () => {
      const inputQuestion = {
        question: 'Where is the best place in the world?',
        duration: 172,
        points: 5,
        answers: [
          {
            answer: 'Japan',
            correct: true
          },
          {
            answer: 'America',
            correct: false
          },
          {
            answer: 'Australia',
            correct: false
          },
          {
            answer: 'Germany',
            correct: false
          },
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
      };
      HTTP.adminQuizQuestionCreate({ token: token, quizid: quizId, questionBody: inputQuestion });

      const res = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when points are out of valid range', () => {
      inputUpdate.points = 0;
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputUpdate.points = 11;
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);
    });

    test('Case when answer strings are duplicates or too long', () => {
      inputUpdate.answers = [{
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Prince Charles',
        correct: false
      }
      ];
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputUpdate.answers = [{
        answer: 'A'.repeat(31),
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      }
      ];
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);

      inputUpdate.answers = [{
        answer: '',
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      }
      ];
      const res3 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res3.body.toString())).toStrictEqual(ERROR);
      expect(res3.statusCode).toStrictEqual(400);
    });

    test('Case when there are no correct answers', () => {
      inputUpdate.answers = [{
        answer: 'Prince Charles',
        correct: false
      },
      {
        answer: 'Queen Elizabeth',
        correct: false
      }
      ];
      const res = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for an invalid thumbnail', () => {
      inputUpdate.thumbnailUrl = '';
      const res1 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(400);

      inputUpdate.thumbnailUrl = 'http://baidu.com/new/picture/road';
      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(400);

      inputUpdate.thumbnailUrl = 'baidu.com/new/picture/road';
      const res3 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res3.body.toString())).toStrictEqual(ERROR);
      expect(res3.statusCode).toStrictEqual(400);
    });

    test('Case when user is not an owner of the quiz or quiz does not exist', () => {
      const resUser = HTTP.adminAuthRegister({
        email: 'brattyBoop@gmail.com',
        password: 'helloEarth12',
        nameFirst: 'Betty',
        nameLast: 'Boop'
      });
      const token2 = JSON.parse(resUser.body.toString()).token;

      const res1 = HTTP.adminQuizQuestionUpdate({ token: token2, quizid: quizId, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(403);

      const res2 = HTTP.adminQuizQuestionUpdate({ token: token, quizid: quizId + 1, questionid: questionId, questionBody: inputUpdate });
      expect(JSON.parse(res2.body.toString())).toStrictEqual(ERROR);
      expect(res2.statusCode).toStrictEqual(403);
    });
  });
});
