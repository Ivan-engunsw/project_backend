import {
  getData,
  setData,
  Data,
  User,
  Quiz,
  Question,
  Answer,
  EmptyObject
} from './dataStore';
import * as error from './errors';
import {
  getQuizById,
  getUserByEmail,
  getUserById,
  takenQuizName,
  timeNow,
  validQuizDesc,
  validQuizName,
  validQuestionBody,
  generateQuizId,
  generateQuestionId,
  getQuestionById,
  validNewPosition,
  sumDuration,
  validThumbnail,
} from './helper';

export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: {
    answer: string,
    correct: boolean
  } [];
  thumbnailUrl ? : string;
}

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} authUserId - authorised user Id
 * @returns {{quizzes}} - object containing quizId and name
 */
export function adminQuizList(authUserId: number): {
  quizzes: {
    quizId: number,
    name: string
  } []
} {
  const data: Data = getData();

  // Create a list of quizzes
  const quizList: {
      quizId: number,
      name: string
    } [] =
    data.quizzes.reduce((arr, {
      quizId,
      name,
      userId
    }) => (userId === authUserId)
      ? arr.push({
        quizId,
        name
      }) && arr
      : arr, []);

  return {
    quizzes: quizList
  };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {number} authUserId - authorised user id
 * @param {string} name - new name of quiz
 * @param {string} description - description about the quiz
 * @returns {{quizId}} - object containing quizId
 */
export function adminQuizCreate(authUserId: number, name: string, description: string): {
  quizId: number
} {
  const data: Data = getData();

  // Check input is valid
  if (!validQuizName(name)) {
    throw new Error(error.QuizNameInvalid(name));
  }
  if (takenQuizName(data, authUserId, name)) {
    throw new Error(error.QuizNameTaken(name));
  }
  if (!validQuizDesc(description)) {
    throw new Error(error.QuizDescInvalid());
  }

  // Create the quiz
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

  return {
    quizId: quizId
  };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @returns {{}} - return object
 */
export function adminQuizRemove
(quizId: number): EmptyObject {
  const data: Data = getData();

  // Find the quiz
  const i: number = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // Delete the quiz
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
export function adminQuizInfo
(quizId: number): Omit < Quiz, 'userId' > {
  const data: Data = getData();

  // Find the quiz
  const quiz: Quiz = getQuizById(data, quizId);
  const {
    userId,
    ...filtered
  } = quiz;

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
export function adminQuizNameUpdate
(authUserId: number, quizId: number, name: string): EmptyObject {
  const data: Data = getData();

  // Check the name provided
  if (!validQuizName(name)) {
    throw new Error(error.QuizNameInvalid(name));
  }

  const quiz: Quiz = getQuizById(data, quizId);

  // Check if the user has another quiz with the same name
  if (takenQuizName(data, authUserId, name)) {
    throw new Error(error.QuizNameTaken(name));
  }

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
export function adminQuizDescriptionUpdate
(quizId: number, description: string): EmptyObject {
  const data: Data = getData();

  // Check the description provided
  if (!validQuizDesc(description)) {
    throw new Error(error.QuizDescInvalid());
  }

  const quiz: Quiz = getQuizById(data, quizId);

  // Update the description of the quiz and return
  quiz.description = description;
  quiz.timeLastEdited = timeNow();

  setData(data);

  return {};
}

/**
 * Given a quizId and a target email, transfer ownership of the quiz to the target
 *
 * @param {number} authUserId - user calling the function
 * @param {number} quizId - the quiz to transfer
 * @param {email} email - the email of the user to transfer the quiz to
 * @returns {{}} - empty object
 */
export function adminQuizTransfer
(authUserId: number, quizId: number, email: string): EmptyObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);

  // Check the email is not the current user's email
  if (user.email === email) {
    throw new Error(error.EmailInvalid(email));
  }

  const quiz: Quiz = getQuizById(data, quizId);

  // Check the target exists
  const targetUser: User = getUserByEmail(data, email);
  if (!targetUser) {
    throw new Error(error.EmailNotFound(email));
  }

  // Check the target does not have an overlapping name
  if (takenQuizName(data, targetUser.userId, quiz.name)) {
    throw new Error(error.QuizNameTaken(quiz.name));
  }

  // Transfer ownership of the quiz
  quiz.userId = targetUser.userId;

  setData(data);

  return {};
}

/**
 * View all the user's quizzes inside the trash
 *
 * @param {number} authUserId - User calling this function
 * @returns {{quizList}} - A list of quizzes in the trash
 */
export function adminQuizTrashView(authUserId: number): {
  quizzes: {
    quizId: number,
    name: string
  } []
} {
  const data: Data = getData();

  // Create a list of quizzes in the trash
  const trashList: {
      quizId: number,
      name: string
    } [] =
    data.trash.reduce((arr, {
      quizId,
      name,
      userId
    }) => (userId === authUserId)
      ? arr.push({
        quizId,
        name
      }) && arr
      : arr, []);

  return {
    quizzes: trashList
  };
}

export function adminQuizTrashEmpty
(quizIds: number[]): EmptyObject {
  const data: Data = getData();

  // Check if quiz isn't in trash
  for (const id of quizIds) {
    const quiz: Quiz = getQuizById(data, id);
    if (quiz) {
      throw new Error(error.QuizNotDeleted(id));
    }
  }

  for (const id of quizIds) {
    data.trash.splice(data.trash.findIndex(quiz => quiz.quizId === id), 1);
  }

  setData(data);
  return {};
}

/**
 * Given a quizId, restore it from the trash into the user's quizzes
 *
 * @param {number} authUserId - User calling the function
 * @param {number} quizId - Quiz to restore
 * @returns {{}} - Empty object
 */
export function adminQuizRestore
(quizId: number): EmptyObject {
  const data: Data = getData();

  // Check if quiz isn't in trash
  const quiz: Quiz = getQuizById(data, quizId);
  if (quiz) {
    throw new Error(error.QuizNotDeleted(quizId));
  }

  // Find quiz in trash
  const i: number = data.trash.findIndex(quiz => quiz.quizId === quizId);

  // Check if name is taken by quiz not in trash
  if (data.quizzes.some(quiz => quiz.name === data.trash[i].name)) {
    throw new Error(error.QuizNameRestoredTaken(data.trash[i].name));
  }

  // Restore quiz
  data.trash[i].timeLastEdited = timeNow();
  data.quizzes.push(data.trash[i]);
  data.trash.splice(i, 1);

  setData(data);

  return {};
}

/**
 * Create a question inside the quiz given by the user
 *
 * @param {number} authUserId - User creating the question
 * @param {number} quizId - The quiz inside which to create the question
 * @param {QuestionBody} questionBody - The body containing information of the question to create
 * @returns {{questionId}} - Object containing the questionId
 */
export function adminQuizQuestionCreate
(quizId: number, questionBody: QuestionBody): {
  questionId: number
} {
  const data: Data = getData();

  const quiz: Quiz = getQuizById(data, quizId);

  // Check the validity of the question body
  try {
    validQuestionBody(questionBody, quiz);
  } catch (error) {
    throw new Error(error.message);
  }

  // Check the duration of the quiz with the new question
  if (sumDuration(quiz) + questionBody.duration > 180) {
    throw new Error(error.invalidQuizDuration(sumDuration(quiz) + questionBody.duration));
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

  if (questionBody.thumbnailUrl) {
    question.thumbnailUrl = questionBody.thumbnailUrl;
  }

  // Update the quiz
  quiz.questions.push(question);
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = timeNow();
  quiz.numQuestions++;
  setData(data);

  return {
    questionId: question.questionId
  };
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
export function adminQuizQuestionUpdate
(quizId: number, questionId: number, questionBody: QuestionBody):
EmptyObject {
  const data: Data = getData();

  const quiz: Quiz = getQuizById(data, quizId);

  // Find the question within the quiz
  const existingQuestion: Question = getQuestionById(quiz, questionId);
  if (!existingQuestion) throw new Error(error.QuestionIdNotFound(questionId));

  // Check the validity of the question body
  try {
    validQuestionBody(questionBody, quiz);
  } catch (error) {
    throw new Error(error.message);
  }

  // Check the duration of the quiz with the new question
  if (sumDuration(quiz) - existingQuestion.duration + questionBody.duration > 180) {
    throw new Error(error.invalidQuizDuration(sumDuration(quiz) - existingQuestion.duration +
    questionBody.duration));
  }

  // Update the question details
  existingQuestion.question = questionBody.question;
  existingQuestion.duration = questionBody.duration;
  existingQuestion.points = questionBody.points;
  if (Object.keys(questionBody).includes('thumbnailUrl')) {
    existingQuestion.thumbnailUrl = questionBody.thumbnailUrl;
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
  existingQuestion.answers = answers;

  // Update the quiz
  quiz.duration = sumDuration(quiz);
  quiz.timeLastEdited = timeNow();
  setData(data);

  return {};
}

/**
 * Delete a particular question from a quiz.
 *
 * @param {number} authUserId - Authorised user ID
 * @param {number} quizId - ID of the quiz containing the question
 * @param {number} questionId - ID of the question to delete
 * @returns {EmptyObject | error.ErrorObject} - Empty object or error object
 */
export function adminQuizQuestionDelete
(quizId: number, questionId: number): EmptyObject {
  const data: Data = getData();

  const quiz: Quiz = getQuizById(data, quizId);

  // Find the question within the quiz
  const question: Question = getQuestionById(quiz, questionId);
  if (!question) throw new Error(error.QuestionIdNotFound(questionId));

  // Remove the question from the quiz
  const questionIndex = quiz.questions.indexOf(question);
  quiz.questions.splice(questionIndex, 1);

  // Update the quiz
  quiz.numQuestions--;
  quiz.duration = sumDuration(quiz);
  quiz.timeLastEdited = timeNow();
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
export function adminQuizQuestionMove
(quizId: number, questionId: number, newPosition: number):
EmptyObject {
  const data: Data = getData();
  const quiz: Quiz = getQuizById(data, quizId);

  // Check the question exists
  const question: Question = getQuestionById(quiz, questionId);
  if (!question) throw new Error(error.QuestionIdNotFound(questionId));

  const currentPosition = quiz.questions.indexOf(question);
  if (validNewPosition(quiz, newPosition, currentPosition)) {
    quiz.questions.splice(currentPosition, 1);
    quiz.questions.splice(newPosition, 0, question);
  } else {
    throw new Error(error.invalidNewPosition(newPosition));
  }
  quiz.timeLastEdited = timeNow();
  setData(data);
  return {};
}

/**
 * Duplicates a quiz question
 * @param authUserId - authorised user id
 * @param quizId - id of quiz
 * @param questionId - id of question
 * @returns {{newQuestionId}} - object containing new questionId
 */
export function adminQuizQuestionDuplicate
(quizId: number, questionId: number): {
  newQuestionId: number
} {
  const data: Data = getData();
  const quiz: Quiz = getQuizById(data, quizId);

  // Check the question exists
  const question: Question = getQuestionById(quiz, questionId);
  if (!question) throw new Error(error.QuestionIdNotFound(questionId));

  // Create the duplicated question
  const duplicateQuestion: Question = {
    questionId: generateQuestionId(quizId),
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers,
  };

  if (Object.keys(question).includes('thumbnailUrl')) {
    duplicateQuestion.thumbnailUrl = question.thumbnailUrl;
  }

  // Check the duration of the quiz with the new question
  if (sumDuration(quiz) + duplicateQuestion.duration > 180) {
    throw new Error(error.invalidQuizDuration(sumDuration(quiz) + duplicateQuestion.duration));
  }

  // Update the quiz
  quiz.duration += duplicateQuestion.duration;
  quiz.timeLastEdited = timeNow();
  quiz.numQuestions++;
  const currentPosition = quiz.questions.indexOf(question);
  quiz.questions.splice(currentPosition + 1, 0, duplicateQuestion);
  setData(data);

  return {
    newQuestionId: duplicateQuestion.questionId
  };
}

/**
 *
 * @param quizId - number
 * @param imgUrl - string
 * @returns {} - empty object
 */
export function adminQuizThumbnailUpdate(quizId: number, imgUrl: string) {
  if (!validThumbnail(imgUrl)) {
    throw new Error(error.invalidThumbnail(imgUrl));
  }

  const data = getData();
  const quiz = getQuizById(data, quizId);
  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = timeNow();
  setData(data);

  return {};
}
