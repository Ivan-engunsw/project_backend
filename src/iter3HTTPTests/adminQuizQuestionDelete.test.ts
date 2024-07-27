import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const INPUT_USER = {
  email: 'originalemail@gmail.com',
  password: '1234zyx#@',
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

describe('DELETE /v2/admin/quiz/:quizid/question/:questionid', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
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
  });

  describe('functionality testing', () => {
    test('Successfully deletes the question', () => {
      const res1 = HTTP.adminQuizQuestionDelete({ token: token, quizid: quizId, questionid: questionId });
      expect(JSON.parse(res1.body.toString())).toStrictEqual({});

      const res2 = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const updatedQuiz = JSON.parse(res2.body.toString());
      expect(updatedQuiz.questions).toHaveLength(0);
    });
  });

  describe('Error Testing', () => {
    test('Case when token is invalid', () => {
      const res = HTTP.adminQuizQuestionDelete({ token: token + 1, quizid: quizId, questionid: questionId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Case when quiz is not found from quizid', () => {
      const res = HTTP.adminQuizQuestionDelete({ token: token, quizid: quizId + 1, questionid: questionId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Case when question ID does not refer to a valid question within this quiz', () => {
      const res = HTTP.adminQuizQuestionDelete({ token: token, quizid: quizId, questionid: questionId + 1 });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Case when user is not the owner of the quiz', () => {
      const resUser2 = HTTP.adminAuthRegister({
        email: 'secondemail@gmail.com',
        password: '1234zyx#@',
        nameFirst: 'Naruto',
        nameLast: 'Uzumaki'
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;

      const res = HTTP.adminQuizQuestionDelete({ token: token2, quizid: quizId, questionid: questionId });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });
});
