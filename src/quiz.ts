import { getData, setData, Data, User, Quiz, Question, Answer, EmptyObject } from './dataStore';
import * as error from './errors';
import { getQuizById, getUserByEmail, getUserById, takenQuizName, timeNow, validQuizDesc, validQuizName, validQuestion, generateQuizId, sumDuration } from './helper';

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

  // Check the length of the question
  if (!(validQuestion(questionBody.question))) { return error.invalidQuestion(questionBody.question) }

  // Check the number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) { 
    return error.invalidNumAnswers(questionBody.answers.length);
  }

  // Check the duration
  if (questionBody.duration < 0) { return error.invalidDuration(questionBody.duration) }

  // Check the duration of the quiz with the new question
  if (sumDuration(quiz) + questionBody.duration > 180) {
    return error.invalidQuizDuration(sumDuration(quiz) + questionBody.duration);
  }
  
  // Check the points of the question
  if (questionBody.points < 1 || questionBody.points > 10) {
    return error.invalidPoints(questionBody.points);
  }

  // Check the length of each answer
  if (questionBody.answers.find(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    return error.invalidAnswerLen();
  }

  // Check for duplicate answers
  let answersSoFar: string[] = [];
  for (let answer of questionBody.answers) {
    if (answersSoFar.includes(answer.answer)) {
      return error.duplicateAnswer(answer.answer);
    } else {
      answersSoFar.push(answer.answer);
    }
  }

  // Check there is at least 1 correct answer
  if (!questionBody.answers.some(answer => answer.correct === true)) {
    return error.noCorrectAnswer();
  }

  // Create the answers array
  const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'brown', 'orange'];
  let answers: Answer[] = [];
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
    questionId: quiz.questions.length,
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
