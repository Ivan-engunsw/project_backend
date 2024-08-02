import { Action, EmptyObject, State, UserScore, getData, setData } from './dataStore';
import {
  timeNow, findPlayerByName, findSessionBySessionId, findSessionByPlayerId,
  findPlayerNameByID, validMessageLength, generateId, validAnswerIds, validPosition
} from './helper';
import * as error from './errors';
import { adminQuizSessionUpdate } from './session';

export interface body {
  message: {
    messageBody: string;
  }
}

interface questionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime?: number;
  percentCorrect?: number;
}

export interface finalResults {
  usersRankedByScore: UserScore[];
  questionResults: questionResult[];
}

export function playerChatSend(playerid: number, body: body) {
  const data = getData();

  const session = findSessionByPlayerId(playerid);
  if (!session) {
    throw new Error(error.playerIdNotFound(playerid));
  }

  if (!validMessageLength(body.message.messageBody)) {
    throw new Error(error.invalidMessageLength());
  }

  const name = findPlayerNameByID(playerid);
  const time = timeNow();

  session.messages.push({
    messageBody: body.message.messageBody,
    playerId: playerid,
    playerName: name,
    timeSent: time
  });

  setData(data);

  return {};
}

export function playerSessionJoin(sessionId: number, name: string) {
  const data = getData();

  // Check the session exists
  const session = findSessionBySessionId(data, sessionId);
  if (!session) {
    throw new Error(error.SessionIdNotFound(sessionId));
  }

  // Check the session is in LOBBY state
  if (session.state !== State.LOBBY) {
    throw new Error(error.invalidState(session.state));
  }

  // Check the name is unique
  if (findPlayerByName(session, name)) {
    throw new Error(error.nameTaken(name));
  }

  // Generate a random name if string is empty

  // Generate the playerId
  let playerId: number;
  do {
    playerId = generateId('number') as number;
  } while (session.players.find(player => player.playerId === playerId));

  // Create the new player
  session.players.push({
    playerId: playerId,
    name: name
  });

  // Check if autoStartNum has been reached
  if (session.players.length === session.autoStartNum) {
    adminQuizSessionUpdate(session.metadata.quizId, session.sessionId, Action.NEXT_QUESTION);
  }

  setData(data);

  return { playerId: playerId };
}

/**
 * Gets the session status of the player is in
 *
 * @param playerId - number
 * @returns the state of the session, questionPosition, and number of questions
 */
export function playerSessionStatus(playerId: number) {
  // const data = getData();

  const session = findSessionByPlayerId(playerId);
  if (!session) {
    throw new Error(error.playerIdNotFound(playerId));
  }

  // Return player status
  return {
    state: session.state,
    numQuestions: session.metadata.questions.length, // assuming session.metadata contains the quiz questions
    atQuestion: ['LOBBY', 'FINAL_RESULTS', 'END'].includes(session.state) ? 0 : session.atQuestion
  };
}

/**
 * Get the info of the question the player is on
 *
 * @param playerId - number
 * @param questionPosition - number
 * @returns Info about the current question the player is on
 */
export function playerQuestionInfo(playerId: number, questionPosition: number) {
  const session = findSessionByPlayerId(playerId);
  if (!session) {
    throw new Error(error.playerIdNotFound(playerId));
  }

  if (['LOBBY', 'QUESTION_COUNTDOWN', 'FINAL_RESULTS', 'END'].includes(session.state)) {
    throw new Error(error.invalidState(session.state));
  }

  questionPosition--;

  if (!validPosition(session.metadata, questionPosition)) {
    throw new Error(error.invalidPosition(questionPosition + 1));
  }

  if (session.atQuestion - 1 !== questionPosition) {
    throw new Error(error.incorrectPosition(session.metadata.quizId, questionPosition + 1));
  }

  const question = session.metadata.questions[questionPosition];

  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: question.answers.map(answer => ({
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour
    }))
  };
}

export function playerQuestionAnswer
(playerid: number, questionposition: number, answerIds: number[]): EmptyObject {
  questionposition--;

  if (!answerIds.length) throw new Error(error.noAnswerIds());

  const session = findSessionByPlayerId(playerid);
  if (!session) throw new Error(error.playerIdNotFound(playerid));

  const validPos = validPosition(session.metadata, questionposition);
  if (!validPos) throw new Error(error.invalidPosition(questionposition));

  const correctState = (session.state === 'QUESTION_OPEN');
  if (!correctState) throw new Error(error.invalidState(session.state));

  const correctPos = ((session.atQuestion - 1) === questionposition);
  if (!correctPos) {
    throw new
    Error(error.incorrectPosition(session.metadata.quizId, questionposition));
  }

  const duplicateAnsIds = new Set(answerIds).size !== answerIds.length;
  if (duplicateAnsIds) throw new Error(error.duplicateAnswerIds());

  const validAnsIds = validAnswerIds(session.metadata, questionposition, answerIds);
  if (!validAnsIds) throw new Error(error.invalidAnswerIds());

  session.questionResults[questionposition].submissions.push({
    name: session.players.find(player => player.playerId === playerid).name,
    answers: answerIds,
    timeSubmitted: timeNow()
  });

  return {};
}

export function playerChatView(playerid: number) {
  const session = findSessionByPlayerId(playerid);
  if (!session) {
    throw new Error(error.playerIdNotFound(playerid));
  }

  const messages = session.messages;
  return { messages };
}

/**
 *
 * @param playerId - the id of a player
 * @returns {{finalResults}} - object containing ranks of users and results of each question
 */
export function playerResult(playerId: number): finalResults {
  if (!findSessionByPlayerId(playerId)) {
    throw new Error(error.invalidPlayer(playerId));
  }

  const session = findSessionByPlayerId(playerId);
  if (session.state !== State.FINAL_RESULTS) {
    throw new Error(error.sessionsNotInFinalResultsState());
  }

  const finalResults: finalResults = { questionResults: [], usersRankedByScore: [] };
  session.questionResults.forEach((questionResult) => finalResults.questionResults.push({
    questionId: questionResult.questionId,
    playersCorrectList: questionResult.playersCorrectList,
    averageAnswerTime: questionResult.averageAnswerTime,
    percentCorrect: questionResult.percentCorrect
  }));
  session.usersRankedByScore.forEach((rank) => finalResults.usersRankedByScore.push({ name: rank.name, score: Math.round(rank.score) }));
  return finalResults;
}
