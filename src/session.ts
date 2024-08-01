import { Action, State, getData, mapDelete, mapSet, setData } from './dataStore';
import { findSessionBySessionId, findSessionsByQuizId, generateId, getQuizById, timeNow, updateSessionResults } from './helper';
import * as error from './errors';
import { adminQuizInfo } from './quiz';

// CONSTANTS //
const COUNTDOWN = 3;

/**
 * Starts a new session with the given quizId
 *
 * @param quizId - number
 * @param autoStartNum - number
 * @returns { sessionId: number }
 */
export function adminQuizSessionStart(quizId: number, autoStartNum: number) {
  // Check the autoStartNum
  if (autoStartNum > 50) {
    throw new Error(error.invalidAutoStartNum(autoStartNum));
  }

  const data = getData();

  // Check there aren't already 10 sessions
  if (findSessionsByQuizId(data, quizId).length === 10) {
    throw new Error(error.tooManySessions(quizId));
  }

  // Check the quiz is not in the trash
  if (data.trash.find(quiz => quiz.quizId === quizId)) {
    throw new Error(error.quizInTrash(quizId));
  }

  // Retrieve the metadata
  const quiz = getQuizById(data, quizId);

  // Check the quiz has questions
  if (quiz.questions.length === 0) {
    throw new Error(error.noQuestions(quizId));
  }

  // Generate sessionId
  let sessionId: number;
  do {
    sessionId = generateId('number') as number;
  } while (data.sessions.find(session => session.sessionId === sessionId));

  // Create the session and setData
  data.sessions.push({
    sessionId: sessionId,
    autoStartNum: autoStartNum,
    state: State.LOBBY,
    atQuestion: 0,
    players: [],
    metadata: adminQuizInfo(quizId),
    questionResults: [],
    usersRankedByScore: [],
    messages: [],
  });
  setData(data);

  return { sessionId: sessionId };
}

export function adminQuizSessionUpdate(quizId: number, sessionId: number, action: Action) {
  // Check the action is a valid action
  if (!(action in Action)) {
    throw new Error(error.invalidAction(action));
  }

  const data = getData();

  // Check the session exists
  const session = findSessionBySessionId(data, sessionId);
  if (!session) {
    throw new Error(error.SessionIdNotFound(sessionId));
  }

  // Check the sessionId is for the correct quizId
  if (session.metadata.quizId !== quizId) {
    throw new Error(error.invalidSessionIdforQuizId(quizId, sessionId));
  }

  // Check the action can be executed from current state and execute the action
  const actions = {
    [Action.NEXT_QUESTION]: () => {
      // Check state
      if (session.state !== State.LOBBY && session.state !== State.QUESTION_CLOSE && session.state !== State.ANSWER_SHOW) {
        throw new Error(error.invalidAction(action));
      }

      // Check session has not reached end of questions
      if (session.atQuestion === session.metadata.numQuestions) {
        throw new Error(`${error.invalidAction(action)} as session has reached end of questions`);
      }

      // Create timeout to OPEN_QUESTION
      session.state = State.QUESTION_COUNTDOWN;
      session.atQuestion++;
      const timeoutId = setTimeout(() => {
        try {
          adminQuizSessionUpdate(quizId, sessionId, Action.OPEN_QUESTION);
        } catch (error) {
          console.log(`Failed to move from QUESTION_COUNTDOWN to QUESTION_OPEN because ${error.message}`);
        }
      }, COUNTDOWN * 1000);
      mapSet(sessionId, timeoutId);
    },
    [Action.SKIP_COUNTDOWN]: () => {
      // Check state
      if (session.state !== State.QUESTION_COUNTDOWN) {
        throw new Error(error.invalidAction(action));
      }

      // Delete QUESTION_COUNTDOWN timeout and OPEN_QUESTION
      mapDelete(sessionId);
      adminQuizSessionUpdate(quizId, sessionId, Action.OPEN_QUESTION);
    },
    [Action.OPEN_QUESTION]: () => {
      // Check state
      if (session.state !== State.QUESTION_COUNTDOWN) {
        throw new Error(error.invalidAction(action));
      }

      // Clear existing timeout and create timeout to CLOSE_QUESTION and initialise questionResults
      mapDelete(sessionId);
      session.state = State.QUESTION_OPEN;
      session.questionResults.push({
        questionId: session.metadata.questions[session.atQuestion - 1].questionId,
        playersCorrectList: [],
        submissions: [],
        scores: [],
        timeStarted: timeNow(),
      });
      const questionDuration = session.metadata.questions[session.atQuestion - 1].duration;
      const timeoutId = setTimeout(() => {
        try {
          adminQuizSessionUpdate(quizId, sessionId, Action.CLOSE_QUESTION);
        } catch (error) {
          console.log(`Failed to move from QUESTION_OPEN to QUESTION_CLOSE because ${error.message}`);
        }
      }, questionDuration * 1000);
      mapSet(sessionId, timeoutId);
    },
    [Action.CLOSE_QUESTION]: () => {
      // Check state
      if (session.state !== State.QUESTION_OPEN) {
        throw new Error(error.invalidAction(action));
      }

      // CLOSE_QUESTION
      session.state = State.QUESTION_CLOSE;

      // Update results
      updateSessionResults(session);
    },
    [Action.GO_TO_ANSWER]: () => {
      // Check state
      if (session.state !== State.QUESTION_OPEN && session.state !== State.QUESTION_CLOSE) {
        throw new Error(error.invalidAction(action));
      }

      // Delete CLOSE_QUESTION timeout and update results if coming from QUESTION_OPEN
      if (session.state === State.QUESTION_OPEN) {
        mapDelete(sessionId);
        updateSessionResults(session);
      }

      session.state = State.ANSWER_SHOW;
    },
    [Action.GO_TO_FINAL_RESULTS]: () => {
      // Check state
      if (session.state !== State.QUESTION_CLOSE && session.state !== State.ANSWER_SHOW) {
        throw new Error(error.invalidAction(action));
      }

      // GO_TO_FINAL_RESULTS
      session.state = State.FINAL_RESULTS;
      session.atQuestion = 0;
    },
    [Action.END]: () => {
      // Check state
      if (session.state === State.END) {
        throw new Error(error.invalidAction(action));
      }

      // END
      session.state = State.END;
      session.atQuestion = 0;
    }
  };

  try {
    actions[action]();
  } catch (error) {
    throw new Error(error.message);
  }

  // Update session state
  setData(data);

  return {};
}

export function adminQuizSessionStatus(quizId: number, sessionId: number) {
  const data = getData();

  // Check the session exists
  const session = findSessionBySessionId(data, sessionId);
  if (!session) {
    throw new Error(error.SessionIdNotFound(sessionId));
  }

  // Check the sessionId is for the correct quizId
  if (session.metadata.quizId !== quizId) {
    throw new Error(error.invalidSessionIdforQuizId(quizId, sessionId));
  }

  // Return the session status
  const playerNames: string[] = [];
  session.players.forEach(player => playerNames.push(player.name));

  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: playerNames,
    metadata: session.metadata,
  };
}
