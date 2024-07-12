// error
const err = (str: string, code: number): ErrorObject => ({
  errorMsg: str,
  errorCode: code
});
export interface ErrorObject {
    errorMsg: string;
    errorCode: number;
  }

// id
export const UserIdNotFound = (id: number) =>
  err(`The user ID '${id}' was not found`, 401);
export const QuizIdNotFound = (id: number) =>
  err(`The quiz ID '${id}' was not found`, 403);
export const QuizNotDeleted = (id: number) =>
  err(`The quiz ID '${id}' has not been deleted`, 400);
export const QuestionIdNotFound = (id: number) =>
  err(`The question ID '${id}' was not found`, 400);

// email
export const EmailInvalid = (email: string) =>
  err(`The email '${email}' is invalid`, 400);
export const EmailTaken = (email: string) =>
  err(`The email '${email}' is already registered`, 400);
export const EmailNotFound = (email: string) =>
  err(`The email '${email}' is not registered`, 400);

// name
export const FirstNameInvalid = (Fname: string) =>
  err(`The first name '${Fname}' is invalid`, 400);
export const LastNameInvalid = (Lname: string) =>
  err(`The last name '${Lname}' is invalid`, 400);
export const QuizNameInvalid = (Qname: string) =>
  err(`The quiz name '${Qname}' is invalid`, 400);
export const QuizNameTaken = (Qname: string) =>
  err(`The quiz name '${Qname}' is already in use`, 400);
export const QuizNameRestoredTaken = (Qname: string) =>
  err(`The quiz name '${Qname}' of the quiz being restored is already in use`, 400);

// password
export const UserPassCurrInvalid = () => err('The password is invalid', 400);
export const UserPassCurrIncorrect = () => err('The password is incorrect', 400);
export const UserPassOldIncorrect = () => err('The old password is incorrect', 400);
export const UserPassNewInvalid = () => err('The new password is invalid', 400);
export const UserPassNewNotNew = () => err('The new password has already been used', 400);

// description
export const QuizDescInvalid = () => err('The quiz description is too long', 400);

// author
export const QuizUnauthorised = (id: number) =>
  err(`The quiz with ID '${id}' does not belong to you`, 403);

// token
export const InvalidToken = (token: string) =>
  err(`The token '${token}' doesn't exist`, 401);

// quiz
export const QuizNotInTrash = () =>
  err('One or more of the given quizzes are not currently in the trash', 400);

// question
export const invalidQuestion = (question: string) =>
  err(`The question: '${question}' is invalid`, 400);
export const invalidNewPosition = (newPosition: number) =>
  err(`The new position '${newPosition}' is invalid`, 400);

// answer
export const invalidNumAnswers = (numAnswer: number) =>
  err(`The number of answers: '${numAnswer}' is invalid`, 400);
export const invalidAnswerLen = () =>
  err('The length of the answers is invalid', 400);
export const duplicateAnswer = (answer: string) =>
  err(`The answer: '${answer}' has been duplicated`, 400);
export const noCorrectAnswer = () =>
  err('There are no correct answers', 400);

// duration
export const invalidDuration = (duration: number) =>
  err(`The duration: '${duration}' is invalid`, 400);
export const invalidQuizDuration = (duration: number) =>
  err(`The duration of the quiz: '${duration}' exceeds 3 mins`, 400);

// points
export const invalidPoints = (points: number) =>
  err(`The points for the question: '${points}' is invalid`, 400);
