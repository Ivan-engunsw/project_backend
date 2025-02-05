import { State } from './dataStore';

// id
export const QuizIdNotFound = (id: number) =>
  `The quiz ID '${id}' was not found`;
export const QuizNotDeleted = (id: number) =>
  `The quiz ID '${id}' has not been deleted`;
export const QuestionIdNotFound = (id: number) =>
  `The question ID '${id}' was not found`;
export const SessionIdNotFound = (id: number) =>
  `The session ID '${id}' was not found`;

// email
export const EmailInvalid = (email: string) =>
  `The email '${email}' is invalid`;
export const EmailTaken = (email: string) =>
  `The email '${email}' is already registered`;
export const EmailNotFound = (email: string) =>
  `The email '${email}' is not registered`;

// name
export const FirstNameInvalid = (Fname: string) =>
  `The first name '${Fname}' is invalid`;
export const LastNameInvalid = (Lname: string) =>
  `The last name '${Lname}' is invalid`;
export const QuizNameInvalid = (Qname: string) =>
  `The quiz name '${Qname}' is invalid`;
export const QuizNameTaken = (Qname: string) =>
  `The quiz name '${Qname}' is already in use`;
export const QuizNameRestoredTaken = (Qname: string) =>
  `The quiz name '${Qname}' of the quiz being restored is already in use`;

// password
export const UserPassCurrInvalid = () => 'The password is invalid';
export const UserPassCurrIncorrect = () => 'The password is incorrect';
export const UserPassOldIncorrect = () => 'The old password is incorrect';
export const UserPassNewInvalid = () => 'The new password is invalid';
export const UserPassNewNotNew = () => 'The new password has already been used';

// description
export const QuizDescInvalid = () => 'The quiz description is too long';

// author
export const QuizUnauthorised = (id: number) =>
  `The quiz with ID '${id}' does not belong to you`;

// token
export const InvalidToken = (token: string) =>
  `The token '${token}' doesn't exist`;

// question
export const invalidQuestion = (question: string) =>
  `The question: '${question}' is invalid`;
export const invalidPosition = (position: number) =>
  `The position '${position}' is invalid`;
export const incorrectPosition = (quizId: number, position: number) =>
  `The quiz '${quizId}' is not at question '${position}'`;
export const invalidNewPosition = (newPosition: number) =>
  `The new position '${newPosition}' is invalid`;

// answer
export const invalidNumAnswers = (numAnswer: number) =>
  `The number of answers: '${numAnswer}' is invalid`;
export const invalidAnswerLen = () =>
  'The length of the answers is invalid';
export const duplicateAnswer = (answer: string) =>
  `The answer: '${answer}' has been duplicated`;
export const noCorrectAnswer = () =>
  'There are no correct answers';

// answer ids
export const invalidAnswerIds = () =>
  'At least one of the given answer ids is invalid';
export const duplicateAnswerIds = () =>
  'There are duplicate answer ids';
export const noAnswerIds = () =>
  'No answer ids provided';

// duration
export const invalidDuration = (duration: number) =>
  `The duration: '${duration}' is invalid`;
export const invalidQuizDuration = (duration: number) =>
  `The duration of the quiz: '${duration}' exceeds 3 mins`;

// points
export const invalidPoints = (points: number) =>
  `The points for the question: '${points}' is invalid`;

// thumbnail
export const invalidThumbnail = (thumbnailUrl: string) =>
  `The thumbnailUrl: ${thumbnailUrl} is invalid`;

// sessions
export const invalidAutoStartNum = (autoStartNum: number) =>
  `autoStartNum: ${autoStartNum} is invalid`;
export const tooManySessions = (quizId: number) =>
  `There are already 10 sessions for the quizId: ${quizId}`;
export const noQuestions = (quizId: number) =>
  `There are no questions for the quizId: ${quizId}`;
export const quizInTrash = (quizId: number) =>
  `The quizId: ${quizId} is in the trash`;
export const invalidState = (state: State) =>
  `The session is currently in state: ${state}`;
export const invalidAction = (action: string) =>
  `The action: ${action} is invalid`;
export const invalidSessionIdforQuizId = (quizId: number, sessionId: number) =>
  `The sessionId: ${sessionId} is not for the quizId: ${quizId}`;
export const sessionsNotEnded = () =>
  'Some sessions are not in END state yet';
export const sessionsNotInFinalResultsState = () =>
  'The session is not in FINAL_RESULTS state yet';
export const sessionsNotInAnswerShowState = () =>
  'The session is not in ANSWER_SHOW state yet';
export const invalidSession = (sessionId: number) =>
  `The session: ${sessionId} is invalid`;

// players
export const nameTaken = (name: string) =>
  `The name: ${name} is already taken by another player`;
export const playerIdNotFound = (playerId: number) =>
  `The playerId: ${playerId} does not exist`;
export const invalidMessageLength = () =>
  'The message needs to be at least 1 character and no more than 100 characters';
export const invalidPlayer = (playerId: number) =>
  `The playerId: ${playerId} is invalid`;
