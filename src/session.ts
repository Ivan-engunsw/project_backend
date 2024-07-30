import { Action, State, getData, setData } from './dataStore';
import { findSessionBySessionId, findSessionsByQuizId, generateId, getQuizById } from './helper';
import * as error from './errors';

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
    metadata: quiz,
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

  // Check the sessionId is for the correct quizId
  const session = findSessionBySessionId(data, sessionId);
  if (session.metadata.quizId !== quizId) {
    throw new Error(error.invalidSessionIdforQuizId(quizId, sessionId));
  }

  // Check the action can be executed from current state
  switch (session.state) {
    case State.LOBBY:
      switch (action) {
        case Action.NEXT_QUESTION: 
          session.state = State.QUESTION_COUNTDOWN;
          session.atQuestion++;
          // Set timeout for QUESTION_OPEN (need another action to open a question which will also set a timeout for QUESTION_CLOSE)
          // Will also need another action to close a question which will also update info
          break;
        case Action.END: 
          session.state = State.END;
          session.atQuestion = 0;
          break;
        default: throw new Error(error.invalidAction(action));
      }
      break;
    case State.QUESTION_COUNTDOWN:
      switch (action) {
        case Action.SKIP_COUNTDOWN:
          session.state = State.QUESTION_OPEN;
          // Clear timeout created by NEXT_QUESTION
          // Create timeout for QUESTION_CLOSE
          break;
        case Action.END: 
          session.state = State.END;
          session.atQuestion = 0;
          break;
        default: throw new Error(error.invalidAction(action));
      }
      break;
    case State.QUESTION_OPEN:
      switch (action) {
        case Action.GO_TO_ANSWER:
          session.state = State.ANSWER_SHOW;
          // Update info function
          break;
        case Action.END:
          session.state = State.END;
          session.atQuestion = 0;
          break;
        default: throw new Error(error.invalidAction(action));
      }
      break;
    case State.QUESTION_CLOSE:
      switch (action) {
        case Action.NEXT_QUESTION: 
          session.state = State.QUESTION_COUNTDOWN;
          session.atQuestion++;
          // Set timeout for QUESTION_OPEN (need another action to open a question which will also set a timeout for QUESTION_CLOSE)
          // Will also need another action to close a question
          break;
        case Action.GO_TO_ANSWER: 
          session.state = State.ANSWER_SHOW;
          // Dont need update info function
          break;
        case Action.GO_TO_FINAL_RESULTS: 
          session.state = State.FINAL_RESULTS;
          session.atQuestion = 0;
          break;
        case Action.END: 
          session.state = State.END;
          session.atQuestion = 0;
          break;
        default: throw new Error(error.invalidAction(action));
      }
      break;
    case State.ANSWER_SHOW:
      switch (action) {
        case Action.NEXT_QUESTION: 
          session.state = State.QUESTION_COUNTDOWN;
          session.atQuestion++;
          // Set timeout for QUESTION_OPEN (need another action to open a question which will also set a timeout for QUESTION_CLOSE)
          // Will also need another action to close a question
          break;
        case Action.GO_TO_FINAL_RESULTS:
          session.state = State.FINAL_RESULTS;
          session.atQuestion = 0;
          break;
        case Action.END:
          session.state = State.END;
          session.atQuestion = 0;
          break;
        default: throw new Error(error.invalidAction(action));
      }
      break;
    case State.FINAL_RESULTS:
      switch (action) {
        case Action.END:
          session.state = State.END;
          session.atQuestion = 0;
          break;
        default: throw new Error(error.invalidAction(action));
      }
      break;
    case State.END: throw new Error(error.invalidAction(action));
  }

  // Update session state
  setData(data);

  return {};
}
