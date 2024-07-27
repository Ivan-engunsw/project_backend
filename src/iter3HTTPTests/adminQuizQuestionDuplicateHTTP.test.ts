import { timeNow } from '../helper';
import * as HTTP from './HTTPHelper';

const ERROR = { error: expect.any(String) };
const INPUT_QUESTION = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [{
    answer: 'Prince Charles',
    correct: true,
  },
  {
    answer: 'Queen Elizabeth',
    correct: false,
  },
  ],
};
const INPUT_QUESTION2 = {
  question: 'Who is Ronaldo?',
  duration: 4,
  points: 5,
  answers: [{
    answer: 'Football player',
    correct: true
  },
  {
    answer: 'Dancer',
    correct: false
  }
  ],
};

beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('POST /v2/admin/quiz/:quizId/question/:questionId/duplicate', () => {
  test('Token is non-existent', () => {
    const res = HTTP.adminQuizQuestionDuplicate({ token: '0', quizid: 0, questionid: 0 });
    expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
    expect(res.statusCode).toStrictEqual(401);
  });

  describe('After creating tokens', () => {
    let token: string;
    beforeEach(() => {
      const res = HTTP.adminAuthRegister({
        email: 'bettyBoop@gmail.com',
        password: 'helloWorld1',
        nameFirst: 'Betty',
        nameLast: 'Boop'
      });
      token = JSON.parse(res.body.toString()).token;
    });

    test('Token is not a valid user', () => {
      const res1 = HTTP.adminQuizQuestionDuplicate({ token: token + 1, quizid: 0, questionid: 0 });
      expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
      expect(res1.statusCode).toStrictEqual(401);
    });

    describe('After creating quizzes', () => {
      let quiz1: number;
      beforeEach(() => {
        const quizRes1 = HTTP.adminQuizCreate({ token: token, name: 'quiz 1', description: 'Mathematics Quiz' });
        quiz1 = JSON.parse(quizRes1.body.toString()).quizId;
      });

      test('QuizId does not exist', () => {
        const res1 = HTTP.adminQuizQuestionDuplicate({ token: token, quizid: quiz1 + 1, questionid: 0 });
        expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
        expect(res1.statusCode).toStrictEqual(403);
      });

      test('User is not an owner of the quiz', () => {
        const resUser2 = HTTP.adminAuthRegister({
          email: 'auth@two.com',
          password: 'authtwo2',
          nameFirst: 'auth',
          nameLast: 'two'
        });
        const token2 = JSON.parse(resUser2.body.toString()).token;
        const res1 = HTTP.adminQuizQuestionDuplicate({ token: token2, quizid: quiz1 + 1, questionid: 0 });
        expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
        expect(res1.statusCode).toStrictEqual(403);
      });

      describe('After creating questions', () => {
        let questionId1: number;
        let questionId2: number;
        beforeEach(() => {
          const questionRes = HTTP.adminQuizQuestionCreate({
            token: token,
            quizid: quiz1,
            questionBody: INPUT_QUESTION
          });
          questionId1 = JSON.parse(questionRes.body.toString()).questionId;
          const questionRes2 = HTTP.adminQuizQuestionCreate({
            token: token,
            quizid: quiz1,
            questionBody: INPUT_QUESTION2
          });
          questionId2 = JSON.parse(questionRes2.body.toString()).questionId;
        });

        test('QuestionId is not valid', () => {
          const res1 = HTTP.adminQuizQuestionDuplicate({ token: token, quizid: quiz1, questionid: questionId1 + 1 });
          expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
          expect(res1.statusCode).toStrictEqual(400);
        });

        test('New duration exceeds 3 mins', () => {
          const question = Object.assign({}, INPUT_QUESTION);
          question.duration = 100;
          const resLong = HTTP.adminQuizQuestionCreate({ token: token, quizid: quiz1, questionBody: question });
          questionId1 = JSON.parse(resLong.body.toString()).questionId;

          const res1 = HTTP.adminQuizQuestionDuplicate({ token: token, quizid: quiz1, questionid: questionId1 });
          expect(JSON.parse(res1.body.toString())).toStrictEqual(ERROR);
          expect(res1.statusCode).toStrictEqual(400);
        });

        test('Returns correct output and timeLastEdited', () => {
          const res1 = HTTP.adminQuizQuestionDuplicate({ token: token, quizid: quiz1, questionid: questionId1 });
          expect(JSON.parse(res1.body.toString())).toStrictEqual({
            newQuestionId: expect.any(Number)
          });
          const time = timeNow();
          const timeEditedRes = HTTP.adminQuizInfo({ token: token, quizid: quiz1 });
          const timeLastEdited = parseInt(JSON.parse(timeEditedRes.body.toString()).timeLastEdited);
          expect(timeLastEdited).toBeGreaterThanOrEqual(time);
          expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
        });

        test('Correctly duplicates a question', () => {
          const res1 = HTTP.adminQuizQuestionDuplicate({ token: token, quizid: quiz1, questionid: questionId1 });
          expect(JSON.parse(res1.body.toString())).toStrictEqual({
            newQuestionId: expect.any(Number)
          });
          const questionId3 = JSON.parse(res1.body.toString()).newQuestionId;
          const quizRes2 = HTTP.adminQuizInfo({ token: token, quizid: quiz1 });
          const quiz = JSON.parse(quizRes2.body.toString());
          expect(quiz.questions).toStrictEqual([{
            questionId: questionId1,
            question: INPUT_QUESTION.question,
            duration: INPUT_QUESTION.duration,
            points: INPUT_QUESTION.points,
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
          },
          {
            questionId: questionId3,
            question: INPUT_QUESTION.question,
            duration: INPUT_QUESTION.duration,
            points: INPUT_QUESTION.points,
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
          },
          {
            questionId: questionId2,
            question: INPUT_QUESTION2.question,
            duration: INPUT_QUESTION2.duration,
            points: INPUT_QUESTION2.points,
            answers: [{
              answerId: expect.any(Number),
              answer: 'Football player',
              colour: expect.any(String),
              correct: true,
            },
            {
              answerId: expect.any(Number),
              answer: 'Dancer',
              colour: expect.any(String),
              correct: false,
            },
            ],
          }
          ]);

          const time = timeNow();
          const timeEditedRes = HTTP.adminQuizInfo({ token: token, quizid: quiz1 });
          const timeLastEdited = parseInt(JSON.parse(timeEditedRes.body.toString()).timeLastEdited);
          expect(timeLastEdited).toBeGreaterThanOrEqual(time);
          expect(timeLastEdited).toBeLessThanOrEqual(time + 1);
        });
      });
    });
  });
});
