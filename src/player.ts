import { Action, State, UserScore, getData, setData } from './dataStore';
import { filterFinalResults, findPlayerByName, findSessionByPlayerId, findSessionBySessionId, generateId } from './helper';
import * as error from './errors';
import { adminQuizSessionUpdate } from './session';

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
 * 
 * @param playerId - the id of a player
 * @returns {{finalResults}} - object containing ranks of users and results of each question
 */
export function playerResult(playerId: number): finalResults {
  const data = getData();
  if (!findSessionByPlayerId(data, playerId)) {
    throw new Error(error.invalidPlayer(playerId));
  }

  const session = findSessionByPlayerId(data, playerId);
  if (session.state !== State.FINAL_RESULTS) {
    throw new Error(error.sessionsNotInFinal_ResultsState());
  }

  const { sessionId, autoStartNum, state, atQuestion, players, metadata, messages, ... filtered} = session;
  let questionResultsFiltered;
  filtered.usersRankedByScore.forEach((rank) => rank.score = Math.round(rank.score));
  filtered.questionResults.forEach((questionResult) => questionResultsFiltered.push(filterFinalResults(questionResult)));
  filtered.questionResults = questionResultsFiltered;
  return filtered;
}
