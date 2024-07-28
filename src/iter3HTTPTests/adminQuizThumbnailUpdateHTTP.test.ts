import * as HTTP from './HTTPHelper';
import { timeNow } from '../helper';

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

describe('PUT /v1/admin/quiz/:quizid/thumbnail', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Betty\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
  });

  describe('error testing', () => {
    test.each([
      {
        imgUrl: 'http://google.com/some/image/path'
      },
      {
        imgUrl: 'google.com/some/image/path.jpg'
      },
      {
        imgUrl: 'http:google.com/some/image/path.jpg'
      },
      {
        imgUrl: 'google.com/some/image/path'
      },
      {
        imgUrl: 'https://google.com/some/image/path'
      },
      {
        imgUrl: 'http://google.com/some/image/path.jpag'
      },
      {
        imgUrl: 'http://google.com/some/image/path.pmg'
      },
      {
        imgUrl: 'http://google.com/some/image/path.ing'
      },
    ])('returns an error for invalid imgUrl', ({ imgUrl }) => {
      const res = HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: imgUrl });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('returns an error for invalid token', () => {
      const res = HTTP.adminQuizThumbnailUpdate({ token: token + 1, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(401);
    });

    test('returns an error for quizid', () => {
      const res = HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId + 1, imgUrl: 'http://google.com/some/image/path.jpg' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });

    test('returns an error for unauthorised access', () => {
      const resUser2 = HTTP.adminAuthRegister({
        email: 'norman@unsw.com',
        password: 'password1',
        nameFirst: 'Norman',
        nameLast: 'Nile',
      });
      const token2 = JSON.parse(resUser2.body.toString()).token;

      const res = HTTP.adminQuizThumbnailUpdate({ token: token2, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('functionality testing', () => {
    test('has the correct return type', () => {
      const res = HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('successfully updates the quiz thumbnailUrl', () => {
      HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });

      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const quizInfo = JSON.parse(res.body.toString());
      expect(quizInfo).toHaveProperty('thumbnailUrl', 'http://google.com/some/image/path.jpg');
    });

    test('successfully updates the quiz thumbnailUrl multiple times', () => {
      HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });
      HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: 'https://baidu.com/cat/picture/cute.jpg' });

      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const quizInfo = JSON.parse(res.body.toString());
      expect(quizInfo.thumbnailUrl).toStrictEqual('https://baidu.com/cat/picture/cute.jpg');
    });

    test('successfully updates the timeLastEdited', () => {
      const time = timeNow();
      HTTP.adminQuizThumbnailUpdate({ token: token, quizid: quizId, imgUrl: 'http://google.com/some/image/path.jpg' });

      const res = HTTP.adminQuizInfo({ token: token, quizid: quizId });
      const quizInfo = JSON.parse(res.body.toString());
      expect(quizInfo.timeLastEdited).toBeGreaterThanOrEqual(time);
      expect(quizInfo.timeLastEdited).toBeLessThanOrEqual(time + 1);
    });
  });
});
