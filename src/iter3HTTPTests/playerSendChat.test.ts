import { timeNow } from '../helper';
import * as HTTP from './HTTPHelper';

// CONSTANTS //
const ERROR = { error: expect.any(String) };
const INPUT_USER = {
  email: 'validemail1@gmail.com',
  password: 'password1!',
  nameFirst: 'Bobby',
  nameLast: 'Bob'
};
const INPUT_QUESTION = {
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

const MESSAGE = {
  messageBody: 'Hello everyone! Imma beat u.'
};

const SHORT_MESSAGE = {
  messageBody: ''
};
const LONG_MESSAGE = {
  messageBody: 'a'.repeat(101)
};

// TESTING //
beforeEach(() => {
  HTTP.clear();
});

afterEach(() => {
  HTTP.clear();
});

describe('POST /v1/player/{playerid}/chat', () => {
  let token: string;
  let quizId: number;
  let sessionid: number;
  let playerId: number;

  beforeEach(() => {
    const resUser = HTTP.adminAuthRegister(INPUT_USER);
    token = JSON.parse(resUser.body.toString()).token;
    const resQuiz = HTTP.adminQuizCreate({ token: token, name: 'Quiz1', description: 'Bobby\'s quiz' });
    quizId = JSON.parse(resQuiz.body.toString()).quizId;
    HTTP.adminQuizQuestionCreate({ quizid: quizId, token: token, questionBody: INPUT_QUESTION });
    const resSession = HTTP.adminQuizSessionStart({ token: token, quizid: quizId, autoStartNum: 3 });
    sessionid = JSON.parse(resSession.body.toString()).sessionId;
    const resPlayer = HTTP.playerSessionJoin({ sessionId: sessionid, name: 'Ronaldo Sui' });
    playerId = JSON.parse(resPlayer.body.toString()).playerId;
  });

  describe('Error testing', () => {
    test('PlayerID does not exist', () => {
      const res = HTTP.playerChatSend({ playerid: playerId + 1, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('If message body is less than 1 char', () => {
      const res = HTTP.playerChatSend({ playerid: playerId + 1, message: SHORT_MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });

    test('If message body is more than 100 char', () => {
      const res = HTTP.playerChatSend({ playerid: playerId + 1, message: LONG_MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('If the correct message content is sent', () => {
      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const resChatView = HTTP.playerChatView({ playerid: playerId });
      expect(JSON.parse(resChatView.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: expect.any(Number),
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('If the playerid is correctly linked to the message', () => {
      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});

      const resChatView = HTTP.playerChatView({ playerid: playerId });
      expect(JSON.parse(resChatView.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('If the playerName is correctly linked to the message', () => {
      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});

      const resChatView = HTTP.playerChatView({ playerid: playerId });
      expect(JSON.parse(resChatView.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: expect.any(Number),
            playerName: 'Ronaldo Sui',
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('If the timeSent is correctly linked to the message', () => {
      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const time = timeNow();

      expect(JSON.parse(res.body.toString())).toStrictEqual({});

      const resChatView = HTTP.playerChatView({ playerid: playerId });
      const chatView = JSON.parse(resChatView.body.toString());
      expect(chatView).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: expect.any(Number),
            playerName: expect.any(String),
            timeSent: expect.any(Number),
          }
        ]
      });
      expect(chatView.timeSent).toBeGreaterThanOrEqual(time);
      expect(chatView.timeSent).toBeLessThanOrEqual(time + 1);
    });

    test('If multiple messages can be sent by the same user', () => {
      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const res2 = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      expect(JSON.parse(res2.body.toString())).toStrictEqual({});

      const resChatView = HTTP.playerChatView({ playerid: playerId });
      expect(JSON.parse(resChatView.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('If multiple different users can send messages', () => {
      const resPlayer2 = HTTP.playerSessionJoin({ sessionId: sessionid, name: 'Bobby Bob' });
      const playerId2 = JSON.parse(resPlayer2.body.toString()).playerId;

      const res = HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const res2 = HTTP.playerChatSend({ playerid: playerId2, message: MESSAGE });
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      expect(JSON.parse(res2.body.toString())).toStrictEqual({});

      const resChatView = HTTP.playerChatView({ playerid: playerId });
      expect(JSON.parse(resChatView.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId2,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });
  });
});
