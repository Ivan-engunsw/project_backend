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
  let playerId1: number;
  let playerId2: number;

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
      HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const res = HTTP.playerChatView({ playerid: playerId + 1 });

      expect(JSON.parse(res.body.toString())).toStrictEqual(ERROR);
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Functionality testing', () => {
    test('If only 1 message is sent', () => {
      HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const res = HTTP.playerChatView({ playerid: playerId });

      expect(JSON.parse(res.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: expect.any(String),
            playerid: expect.any(Number),
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('If the correct details are stored with one message sent', () => {
      HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const time = timeNow();

      const res = HTTP.playerChatView({ playerid: playerId });
      const chatView = JSON.parse(res.body.toString());
      expect(chatView).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId,
            playerName: 'Ronaldo Sui',
            timeSent: expect.any(Number)
          }
        ]
      });

      expect(chatView.timeSent).toBeGreaterThanOrEqual(time);
      expect(chatView.timeSent).toBeLessThanOrEqual(time + 1);
    });

    test('If multiple messages can be viewed', () => {
      const resPlayer1 = HTTP.playerSessionJoin({ sessionId: sessionid, name: 'Bobs Bob' });
      const resPlayer2 = HTTP.playerSessionJoin({ sessionId: sessionid, name: 'Betty Boop' });
      playerId1 = JSON.parse(resPlayer1.body.toString()).playerId;
      playerId2 = JSON.parse(resPlayer2.body.toString()).playerId;

      HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      HTTP.playerChatSend({ playerid: playerId1, message: MESSAGE });
      HTTP.playerChatSend({ playerid: playerId2, message: MESSAGE });

      const res = HTTP.playerChatView({ playerid: playerId });
      expect(JSON.parse(res.body.toString())).toStrictEqual({
        messages: [
          {
            messageBody: expect.any(String),
            playerid: expect.any(Number),
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          },
          {
            messageBody: expect.any(String),
            playerid: expect.any(Number),
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          },
          {
            messageBody: expect.any(String),
            playerid: expect.any(Number),
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        ]
      });
    });

    test('If the messages are returned in the correct order', () => {
      const resPlayer1 = HTTP.playerSessionJoin({ sessionId: sessionid, name: 'Bobs Bob' });
      const resPlayer2 = HTTP.playerSessionJoin({ sessionId: sessionid, name: 'Betty Boop' });
      playerId1 = JSON.parse(resPlayer1.body.toString()).playerId;
      playerId2 = JSON.parse(resPlayer2.body.toString()).playerId;

      HTTP.playerChatSend({ playerid: playerId, message: MESSAGE });
      const time = timeNow();
      HTTP.playerChatSend({ playerid: playerId1, message: MESSAGE });
      const time1 = timeNow();
      HTTP.playerChatSend({ playerid: playerId2, message: MESSAGE });
      const time2 = timeNow();

      expect(time < time1 && time < time2);
      expect(time1 < time2);

      const res = HTTP.playerChatView({ playerid: playerId });
      const chatView = JSON.parse(res.body.toString());
      expect(chatView).toStrictEqual({
        messages: [
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId,
            playerName: 'Ronaldo Sui',
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId1,
            playerName: 'Bobs Bob',
            timeSent: expect.any(Number)
          },
          {
            messageBody: 'Hello everyone! Imma beat u.',
            playerid: playerId2,
            playerName: 'Betty Boop',
            timeSent: expect.any(Number)
          }
        ]
      });

      expect(chatView.messages[0].timeSent).toBeGreaterThanOrEqual(time);
      expect(chatView.messages[0].timeSent).toBeLessThanOrEqual(time + 1);
      expect(chatView.messages[1].timeSent).toBeGreaterThanOrEqual(time1);
      expect(chatView.messages[1].timeSent).toBeLessThanOrEqual(time1 + 1);
      expect(chatView.messages[2].timeSent).toBeGreaterThanOrEqual(time2);
      expect(chatView.messages[2].timeSent).toBeLessThanOrEqual(time2 + 1);
    });
  });
});
