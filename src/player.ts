import { Action, State, getData, setData } from './dataStore';
import { findPlayerByName, findSessionBySessionId, generateId, findPlayerByPlayerId } from './helper';
import * as error from './errors';
import { adminQuizSessionUpdate } from './session';

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

// Function to get player status
export function playerStatus(playerId: number) {
  const data = getData();

  // Find session
  const session = findSessionBySessionId(data, playerId);
  if (!session) {
    return { error: 'Session not found for this player' };
  }

  // Find player
  const player = findPlayerByPlayerId(session, playerId);
  if (!player) {
    return { error: 'Player ID does not exist' };
  }

  // Return player status
  return {
    state: session.state,
    numQuestions: session.metadata.questions.length, // assuming session.metadata contains the quiz questions
    atQuestion: ['LOBBY', 'FINAL_RESULTS', 'END'].includes(session.state) ? 0 : session.atQuestion
  };
}
