import { clear } from '../other';
import { adminQuizCreate, adminQuizInfo, adminQuizQuestionCreate } from '../quiz';
import { adminAuthRegister } from '../auth';

const ERROR = { errorMsg: expect.any(String), errorCode: expect.any(Number) };

beforeEach(() => {
  clear();
});

describe('adminQuizQuestionCreate', () => {
  let authUser;
  let quiz;
  beforeEach(() => {
    authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
    quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Betty\'s quiz');
  });

  describe('error testing', () => {
    test.each([
      {
        questionBody: {
          question: 'Uh?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Sometimes I wonder what question I\'m even asking like is there even any point to asking this?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            },
            {
              answer: 'Mary II',
              correct: false,
            },
            {
              answer: 'Charles II',
              correct: false,
            },
            {
              answer: 'King Arthur',
              correct: false,
            },
            {
              answer: 'Henry VIII',
              correct: false,
            },
            {
              answer: 'Edward VI',
              correct: true,
            },
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: -1,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 49,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 0,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles Junior Knight The Fourth Knave',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: '',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            },
            {
              answer: '',
              correct: true,
            },
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            },
          ],
        }
      },
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 181,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Elizabeth',
              correct: false,
            },
          ],
        }
      },
    ])('returns an error for invalid inputs', ({ questionBody }) => {
      expect(adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody)).toStrictEqual(ERROR);
    });

    test('duration of the question causes the duration of the quiz to be over 3 minutes', () => {
      const questionBody1 = {
        question: 'Who is the Monarch of England?',
        duration: 170,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
      adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody1);
      const questionBody2 = {
        question: 'Why is English food so bad?',
        duration: 11,
        points: 5,
        answers: [
          {
            answer: 'Because they have no culture',
            correct: true,
          },
          {
            answer: 'I\'m not sure',
            correct: false,
          },
        ],
      };
      expect(adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody2)).toStrictEqual(ERROR);
    });

    let questionBody;
    beforeEach(() => {
      questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
    });

    test('returns an error for invalid authUserId', () => {
      adminQuizQuestionCreate(authUser.authUserId + 1, quiz.quizId, questionBody);
    });

    test('returns an error for invalid quizId', () => {
      adminQuizQuestionCreate(authUser.authUserId, quiz.quizId + 1, questionBody);
    });

    test('returns an error for a quiz not owned by the user', () => {
      const authUser2 = adminAuthRegister('norman@unsw.com', 'password1', 'Norman', 'Nile');
      adminQuizQuestionCreate(authUser2.authUserId, quiz.quizId, questionBody);
    });
  });

  describe('functionality testing', () => {
    let questionBody;
    beforeEach(() => {
      questionBody = {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: true,
          },
          {
            answer: 'Queen Elizabeth',
            correct: false,
          },
        ],
      };
    });

    test('has the correct return type', () => {
      expect(adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody)).toStrictEqual({ questionId: expect.any(Number) });
    });

    test('correctly creates a question', () => {
      adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody);
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Who is the Monarch of England?',
            duration: 4,
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
          },
        ],
        duration: 4,
      });
    });

    test('successfully creates multiple questions', () => {
      adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody);
      const questionBody2 = {
        question: 'Why is English food so bad?',
        duration: 11,
        points: 5,
        answers: [
          {
            answer: 'Because they have no culture',
            correct: true,
          },
          {
            answer: 'I\'m not sure',
            correct: false,
          },
        ],
      };
      adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody2);
      expect(adminQuizInfo(authUser.authUserId, quiz.quizId)).toStrictEqual({
        quizId: quiz.quizId,
        name: 'Quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Betty\'s quiz',
        numQuestions: 2,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Who is the Monarch of England?',
            duration: 4,
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
          },
          {
            questionId: expect.any(Number),
            question: 'Why is English food so bad?',
            duration: 11,
            points: 5,
            answers: [
              {
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
          },
        ],
        duration: questionBody.duration + questionBody2.duration,
      });
    });
  });
});
