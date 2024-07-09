import { getData, Data, User, Quiz } from './dataStore';
import * as error from './errors';
import { getQuizById, getUserById, takenQuizName, timeNow, validQuizDesc, validQuizName } from './helper';
type EmptyObject = Record<string, never>;

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} authUserId - authorised user Id
 * @returns {{quizzes}} - object containing quizId and name
 */
export function adminQuizList(authUserId: number): { quizzes: { quizId: number, name: string }[] } | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const quizList: { quizId: number, name: string }[] =
    data.quizzes.reduce((arr, { quizId, name, userId }) => (userId === authUserId) ? arr.push({ quizId, name }) && arr : arr, []);

  return { quizzes: quizList };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {number} authUserId - authorised user id
 * @param {string} name - new name of quiz
 * @param {string} description - description about the quiz
 * @returns {{quizId}} - object containing quizId
 */
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  if (!validQuizName(name)) { return error.QuizNameInvalid(name); }
  if (takenQuizName(data, authUserId, name)) { return error.QuizNameTaken(name); }
  if (!validQuizDesc(description)) { return error.QuizDescInvalid(); }

  const quizId: number = data.quizzes.length;

  data.quizzes.push({
    quizId: quizId,
    userId: authUserId,
    name: name,
    description: description,
    timeCreated: timeNow(),
    timeLastEdited: timeNow(),
  });

  return { quizId: quizId };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @returns {{}} - return object
 */
export function adminQuizRemove(authUserId: number, quizId: number): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const i: number = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (i === -1) return error.QuizIdNotFound(quizId);

  if (data.quizzes[i].userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  data.quizzes.splice(i, 1);

  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @returns {{quizInfo}} - return object
 */
export function adminQuizInfo(authUserId: number, quizId: number): Omit<Quiz, 'userId' > | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);

  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  const { userId, ...filtered } = quiz;

  return filtered;
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @param {string} name - new name of quiz
 * @returns {{}} - empty object
 */
export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  // Check the name provided
  if (!validQuizName(name)) { return error.QuizNameInvalid(name); }

  // Check the user exists
  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Check the quiz exists
  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  // Check if the user has another quiz with the same name
  if (takenQuizName(data, authUserId, name)) { return error.QuizNameTaken(name); }

  // Update the name of the quiz and return
  quiz.name = name;
  quiz.timeLastEdited = timeNow();

  return {};
}

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @param {string} description - new description of quiz
 * @returns {{}} - empty object
 */
export function adminQuizDescriptionUpdate (authUserId: number, quizId: number, description: string): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  // Check the description provided
  if (!validQuizDesc(description)) { return error.QuizDescInvalid(); }

  // Check the user exists
  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Check the quiz exists
  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  // Update the description of the quiz and return
  quiz.description = description;
  quiz.timeLastEdited = timeNow();

  return {};
}
