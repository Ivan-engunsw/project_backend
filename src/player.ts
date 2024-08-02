import { Action, State, getData, setData } from './dataStore';
import { findPlayerByName, findSessionBySessionId, generateId, findSessionByPlayerId } from './helper';
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
export function playerStatusStatus(playerId: number) {
  const data = getData();

  const session = findSessionByPlayerId(data, playerId);
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
