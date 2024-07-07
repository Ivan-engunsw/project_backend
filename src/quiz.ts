import { getData } from './dataStore';
import { errQuizDescInvalid, errQuizIdNotFound, errQuizNameInvalid, errQuizNameTaken, errQuizUnauthorised, errUserIdNotFound } from './errors';
import { getQuizById, getUserById, takenQuizName, timeNow, validQuizDesc, validQuizName } from './helper';

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} authUserId - authorised user Id
 * @returns {{quizzes}} - object containing quizId and name
 */
export function adminQuizList(authUserId: number): { quizzes: object[] } | { error: string, errorCode: number } {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  const quizList = data.quizzes.reduce((arr, { quizId, name, userId }) =>
    (userId === authUserId) ? arr.push({ quizId, name }) && arr : arr, []);

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
export function adminQuizCreate(authUserId: number, name: string, description: string): { quizId: number } | { error: string, errorCode: number } {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  if (!validQuizName(name)) { return errQuizNameInvalid(name); }
  if (takenQuizName(data, authUserId, name)) { return errQuizNameTaken(name); }
  if (!validQuizDesc(description)) { return errQuizDescInvalid(); }

  const quizId = data.quizzes.length;

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
export function adminQuizRemove(authUserId: number, quizId: number): Record<string, never> | {error: string, errorCode: number } {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  const i = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (i === -1) return errQuizIdNotFound(quizId);

  if (data.quizzes[i].userId !== authUserId) { return errQuizUnauthorised(quizId); }

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
export function adminQuizInfo(authUserId: number, quizId: number) {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  const quiz = getQuizById(data, quizId);
  if (!quiz) return errQuizIdNotFound(quizId);

  if (quiz.userId !== authUserId) { return errQuizUnauthorised(quizId); }

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
export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): Record<string, never> | { error: string, errorCode: number } {
  const data = getData();

  // Check the name provided
  if (!validQuizName(name)) { return errQuizNameInvalid(name); }

  // Check the user exists
  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  // Check the quiz exists
  const quiz = getQuizById(data, quizId);
  if (!quiz) return errQuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return errQuizUnauthorised(quizId); }

  // Check if the user has another quiz with the same name
  if (takenQuizName(data, authUserId, name)) { return errQuizNameTaken(name); }

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
export function adminQuizDescriptionUpdate (authUserId: number, quizId: number, description: string): Record<string, never> | { error: string, errorCode: number } {
  const data = getData();

  // Check the description provided
  if (!validQuizDesc(description)) { return errQuizDescInvalid(); }

  // Check the user exists
  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  // Check the quiz exists
  const quiz = getQuizById(data, quizId);
  if (!quiz) return errQuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return errQuizUnauthorised(quizId); }

  // Update the description of the quiz and return
  quiz.description = description;
  quiz.timeLastEdited = timeNow();

  return {};
}
