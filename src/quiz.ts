import { getData, setData, Data, User, Quiz, Question, Answer, EmptyObject } from './dataStore';
import * as error from './errors';
import { getQuizById, getUserByEmail, getUserById, takenQuizName, timeNow, validQuizDesc, validQuizName, validQuestionBody, generateQuizId, generateQuestionId, getQuestionById, validNewPosition } from './helper';

export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: { answer: string, correct: boolean }[];
}

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

  const quizId: number = generateQuizId();

  data.quizzes.push({
    quizId: quizId,
    userId: authUserId,
    name: name,
    description: description,
    timeCreated: timeNow(),
    timeLastEdited: timeNow(),
    numQuestions: 0,
    questions: [],
    duration: 0,
  });

  setData(data);

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

  data.quizzes[i].timeLastEdited = timeNow();
  data.trash.push(data.quizzes[i]);
  data.quizzes.splice(i, 1);

  setData(data);

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

  setData(data);

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

  setData(data);

  return {};
}

export function adminQuizTransfer (authUserId: number, quizId: number, email: string): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  // Check the user exists
  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Check the email is not the current user's email
  if (user.email === email) { return error.EmailInvalid(email); }

  // Check the quiz exists
  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  // Check the target exists
  const targetUser: User = getUserByEmail(data, email);
  if (!targetUser) { return error.EmailNotFound(email); }

  // Check the target does not have an overlapping name
  if (takenQuizName(data, targetUser.userId, quiz.name)) { return error.QuizNameTaken(quiz.name); }

  // Transfer ownership of the quiz
  quiz.userId = targetUser.userId;

  setData(data);

  return {};
}

export function adminQuizViewTrash(authUserId: number): { quizzes: { quizId: number, name: string }[] } | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const trashList: { quizId: number, name: string }[] =
    data.trash.reduce((arr, { quizId, name, userId }) => (userId === authUserId) ? arr.push({ quizId, name }) && arr : arr, []);

  return { quizzes: trashList };
}

export function adminQuizRestore(authUserId: number, quizId: number): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const quiz: Quiz = getQuizById(data, quizId);
  if (quiz) { return error.QuizNotDeleted(quizId); }

  const i: number = data.trash.findIndex(quiz => quiz.quizId === quizId);
  if (i === -1) return error.QuizIdNotFound(quizId);

  if (data.trash[i].userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  if (data.quizzes.some(quiz => quiz.name === data.trash[i].name)) return error.QuizNameRestoredTaken(data.trash[i].name);

  data.trash[i].timeLastEdited = timeNow();
  data.quizzes.push(data.trash[i]);
  data.trash.splice(i, 1);

  setData(data);

  return {};
}

export function adminQuizQuestionCreate(authUserId: number, quizId: number, questionBody: QuestionBody): { questionId: number } | error.ErrorObject {
  const data: Data = getData();

  // Check the user exists
  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Check the quiz exists
  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  const valid = validQuestionBody(questionBody, quiz);
  if ('errorMsg' in valid) {
    return valid as error.ErrorObject;
  }

  // Create the answers array
  const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  const answers: Answer[] = [];
  questionBody.answers.forEach((answer) => {
    answers.push({
      answerId: answers.length,
      answer: answer.answer,
      colour: colours[Math.floor(Math.random() * colours.length)],
      correct: answer.correct,
    });
  });

  // Create the question
  const question: Question = {
    questionId: generateQuestionId(quizId),
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: answers,
  };

  // Update the quiz
  quiz.questions.push(question);
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = timeNow();
  quiz.numQuestions++;
  setData(data);

  return { questionId: question.questionId };
}

/**
 * Update the details of a particular question within a quiz.
 *
 * @param {number} authUserId - Authorised user ID
 * @param {number} quizId - ID of the quiz containing the question
 * @param {number} questionId - ID of the question to update
 * @param {QuestionBody} questionBody - New details for the question
 * @returns {EmptyObject | error.ErrorObject} - Empty object or error object
 */
export function adminQuizQuestionUpdate(authUserId: number, quizId: number, questionId: number, questionBody: QuestionBody): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  // Check if the user exists
  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Check if the quiz exists and belongs to the user
  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);
  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  // Find the question within the quiz
  const existingQuestion: Question = getQuestionById(quiz, questionId);
  if (!existingQuestion) return error.QuestionIdNotFound(questionId);

  // Validate the new question body
  const valid = validQuestionBody(questionBody, quiz);
  if ('errorMsg' in valid) {
    return valid as error.ErrorObject;
  }

  // Update the question details
  existingQuestion.question = questionBody.question;
  existingQuestion.duration = questionBody.duration;
  existingQuestion.points = questionBody.points;

  // Update answers if provided
  if (questionBody.answers && questionBody.answers.length > 0) {
    const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
    existingQuestion.answers = questionBody.answers.map((answer, index) => ({
      answerId: index,
      answer: answer.answer,
      colour: colours[Math.floor(Math.random() * colours.length)],
      correct: answer.correct,
    }));
  }

  // Update last edited time for the quiz
  quiz.timeLastEdited = timeNow();

  // Persist updated data
  setData(data);

  return {};
}

/**
 * Moves a quiz question to new position
 * @param authUserId - authorised user id
 * @param quizId - id of quiz
 * @param questionId - id of question
 * @param newPosition - new position of the question
 * @returns {{}} - empty object
 */
export function adminQuizQuestionMove(authUserId: number, quizId: number, questionId: number, newPosition: number): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  // Check the user exists
  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Check the quiz exists
  const quiz: Quiz = getQuizById(data, quizId);
  if (!quiz) return error.QuizIdNotFound(quizId);

  // Check the quiz belongs to the user
  if (quiz.userId !== authUserId) { return error.QuizUnauthorised(quizId); }

  // Check the question exists
  const question: Question = getQuestionById(quiz, questionId);
  if (!question) return error.QuestionIdNotFound(quizId);

  const currentPosition = quiz.questions.indexOf(question);
  if (validNewPosition(quiz, newPosition, currentPosition)) {
    quiz.questions.splice(currentPosition, 1);
    quiz.questions.splice(newPosition, 0, question);
  } else {
    return error.invalidNewPosition(newPosition);
  }
  quiz.timeLastEdited = timeNow();
  return {};
}
