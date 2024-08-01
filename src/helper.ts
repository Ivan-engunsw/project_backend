import isEmail from 'validator/lib/isEmail';
import {
  Data,
  EmptyObject,
  Quiz,
  Session,
  getData
} from './dataStore';
import {
  QuestionBody
} from './quiz';
import * as error from './errors';
import crypto from 'crypto';

// time
export const timeNow = () =>
  Math.floor(Date.now() / 1000);

// user
export const validUserName = (name: string) =>
  /^[a-zA-Z' -]{2,20}$/.test(name);
export const validUserPass = (pass: string) =>
  /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(pass);
export const getUserByEmail = (data: Data, email: string) =>
  data.users.find(user => email === user.email);
export const getUserById = (data: Data, id: number) =>
  data.users.find(user => id === user.userId);

// email
export const validEmail = (email: string) =>
  isEmail(email);
export const takenEmail = (data: Data, email: string) =>
  data.users.some(user => user.email === email);

// quiz
export const validQuizName = (name: string) =>
  /^[a-zA-Z0-9 ]{3,30}$/.test(name);
export const validQuizDesc = (desc: string) =>
  desc.length <= 100;
export const takenQuizName = (data: Data, uId: number, qName: string) =>
  data.quizzes.some(quiz => quiz.name === qName && quiz.userId === uId);
export const getQuizById = (data: Data, id: number) =>
  data.quizzes.find(quiz => id === quiz.quizId);
export const generateQuizId = () => {
  const data = getData();
  let quizId: number;
  do {
    quizId = generateId('number') as number;
  }
  while (data.quizzes.find(quiz => quiz.quizId === quizId) ||
  data.trash.find(quiz => quiz.quizId === quizId));
  return quizId;
};
export const sumDuration = (quiz: Quiz) =>
  quiz.questions.reduce((sum, question) => sum + question.duration, 0);

// question
// Checks the validity of the questionBody given the questionBody
// and the quiz it will be created inside
export const validQuestionBody =
(questionBody: QuestionBody, quiz: Quiz): EmptyObject => {
  // Check the length of the question
  if (!/^.{5,50}$/.test(questionBody.question)) {
    throw new Error(error.invalidQuestion(questionBody.question));
  }

  // Check the number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw new Error(error.invalidNumAnswers(questionBody.answers.length));
  }

  // Check the duration
  if (questionBody.duration <= 0 || questionBody.duration > 180) {
    throw new Error(error.invalidDuration(questionBody.duration));
  }

  // Check the points of the question
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw new Error(error.invalidPoints(questionBody.points));
  }

  // Check the length of each answer
  if (questionBody.answers.find(answer => answer.answer.length < 1 ||
    answer.answer.length > 30)) {
    throw new Error(error.invalidAnswerLen());
  }

  // Check for duplicate answers
  const answersSoFar: string[] = [];
  for (const answer of questionBody.answers) {
    if (answersSoFar.includes(answer.answer)) {
      throw new Error(error.duplicateAnswer(answer.answer));
    } else {
      answersSoFar.push(answer.answer);
    }
  }

  // Check there is at least 1 correct answer
  if (!questionBody.answers.some(answer => answer.correct === true)) {
    throw new Error(error.noCorrectAnswer());
  }

  // Check the validity of the thumbnail
  if (questionBody.thumbnailUrl !== undefined) {
    if (!validThumbnail(questionBody.thumbnailUrl)) {
      throw new Error(error.invalidThumbnail(questionBody.thumbnailUrl));
    }
  }

  return {};
};

// Checks the validity of a given thumbnail url
export const validThumbnail = (thumbnailUrl: string) => {
  if (thumbnailUrl.length === 0) {
    return false;
  }

  if (!thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    return false;
  }

  if (!thumbnailUrl.toLowerCase().endsWith('jpg') &&
      !thumbnailUrl.toLowerCase().endsWith('jpeg') &&
      !thumbnailUrl.toLowerCase().endsWith('png')) {
    return false;
  }

  return true;
};

// Randomly generates a unique questionId
export const generateQuestionId = (quizId: number) => {
  const data = getData();
  const quiz = getQuizById(data, quizId);
  let questionId: number;
  do {
    questionId = generateId('number') as number;
  }
  while (quiz.questions.find(question => question.questionId === questionId));
  return questionId;
};

export const getQuestionById = (quiz: Quiz, id: number) =>
  quiz.questions.find(question => id === question.questionId);
export const validNewPosition = (quiz: Quiz, position: number, currentPosition: number) =>
  (position >= 0 && position < quiz.questions.length && position !== currentPosition);

// Randomly generates an Id that is a string or a number based on the option it is given
type TypeOptions = 'string' | 'number';

export function generateId(type: TypeOptions = 'number'): string | number {
  switch (type) {
    case 'string': return crypto.randomBytes(16).toString('base64url');
    case 'number': return crypto.randomBytes(4).readUInt32BE();
  }
}

// Hash the given string
export function hash(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

// Check if a given quiz exists and if it is authorised
export function validQuiz(quizId: number, authUserId: number, { trash }: { trash?: boolean } = {}) {
  let quiz = getQuizById(getData(), quizId);
  if (!quiz) {
    switch (trash) {
      case true:
        if (!(quiz = getData().trash.find(quiz => quiz.quizId === quizId))) {
          throw new Error(error.QuizIdNotFound(quizId));
        } break;
      default: throw new Error(error.QuizIdNotFound(quizId));
    }
  }

  if (quiz.userId !== authUserId) {
    throw new Error(error.QuizUnauthorised(quizId));
  }
}

// sessions
export const findSessionsByQuizId = (data: Data, quizId: number) =>
  data.sessions.filter(session => session.metadata.quizId === quizId);
export const findSessionBySessionId = (data: Data, sessionId: number) =>
  data.sessions.find(session => session.sessionId === sessionId);

export function updateSessionResults(session: Session) {
  // Sort submissions by timesubmitted
  const submissions = session.questionResults[session.atQuestion - 1].submissions;
  submissions.sort((a, b) => a.timeSubmitted - b.timeSubmitted);

  // Create the correct answer set
  const correctAnswers = new Set();
  const answers = session.metadata.questions[session.atQuestion - 1].answers;
  answers.forEach((answer) => {
    if (answer.correct) {
      correctAnswers.add(answer.answerId);
    }
  });

  // Find all correct submissions and update the scores and playersCorrectList
  const points = session.metadata.questions[session.atQuestion - 1].points;
  const questionResults = session.questionResults[session.atQuestion - 1];
  submissions.forEach((submission) => {
    if (submission.answers.length === correctAnswers.size && submission.answers.every(answerId => correctAnswers.has(answerId))) {
      const name = submission.name;
      const score = points / (questionResults.scores.length + 1);

      questionResults.scores.push({
        name: name,
        score: score,
      });

      questionResults.playersCorrectList.push(name);
    }
  });

  // Sort playersCorrectList alphabetically
  questionResults.playersCorrectList.sort();

  // Calculate average answer time from submissions
  if (submissions.length !== 0) {
    questionResults.averageAnswerTime = Math.round(submissions.reduce((total, submission) => total + (submission.timeSubmitted - questionResults.timeStarted), 0) / submissions.length);
  } else {
    questionResults.averageAnswerTime = 0;
  }

  // Calculate percent correct
  questionResults.percentCorrect = Math.round((questionResults.playersCorrectList.length / session.players.length) * 100);

  // Update usersRankedByScore
  questionResults.scores.forEach((userScore) => {
    const existingScore = session.usersRankedByScore.find(user => user.name === userScore.name);
    if (existingScore) { // Update existing score
      existingScore.score += userScore.score;
    } else { // Create new score if it doesn't exist
      session.usersRankedByScore.push({
        name: userScore.name,
        score: userScore.score,
      });
    }
  });

  // Sort the scores
  session.usersRankedByScore.sort((a, b) => b.score - a.score);
}

// player
export const findPlayerByName = (session: Session, name: string) =>
  session.players.find(player => player.name === name);


export const findSessionByPlayerId = (playerId: number) => {

  
/*
  for (const session of getData().sessions) {
    for (const player of session.players) {
      if (player.playerId === playerId) {
        return session;
      }
    }
  }
*/
  return getData().sessions.find(session => session.players.some(player => player.playerId == playerId));
}

export const findPlayerNameByID = (playerId: number) => {
  for (const session of getData().sessions) {
    for (const player of session.players) {
      if (player.playerId === playerId) {
        return player.name;
      }
    }
  }
}


export const validMessageLength = (message: string) =>
  1 <= message.length && message.length <= 100