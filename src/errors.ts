// id
export const QuizIdNotFound = (id: number) =>
  `The quiz ID '${id}' was not found`;
export const QuizNotDeleted = (id: number) =>
  `The quiz ID '${id}' has not been deleted`;
export const QuestionIdNotFound = (id: number) =>
  `The question ID '${id}' was not found`;

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
