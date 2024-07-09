// error
const err = (str: string, code: number): ErrorObject => ({ errorMsg: str, errorCode: code });
export interface ErrorObject {
    errorMsg: string;
    errorCode: number;
}

// id
export const UserIdNotFound = (id: number) => err(`The user ID '${id}' was not found`, 400);
export const QuizIdNotFound = (id: number) => err(`The quiz ID '${id}' was not found`, 403);

// email
export const EmailInvalid = (email: string) => err(`The email '${email}' is invalid`, 400);
export const EmailTaken = (email: string) => err(`The email '${email}' is already registered`, 400);
export const EmailNotFound = (email: string) => err(`The email '${email}' is not registered`, 400);

// name
export const FirstNameInvalid = (Fname: string) => err(`The first name '${Fname}' is invalid`, 400);
export const LastNameInvalid = (Lname: string) => err(`The last name '${Lname}' is invalid`, 400);
export const QuizNameInvalid = (Qname: string) => err(`The quiz name '${Qname}' is invalid`, 400);
export const QuizNameTaken = (Qname: string) => err(`The quiz name '${Qname}' is already in use`, 400);

// password
export const UserPassCurrInvalid = () => err('The password is invalid', 400);
export const UserPassCurrIncorrect = () => err('The password is incorrect', 400);
export const UserPassOldIncorrect = () => err('The old password is incorrect', 400);
export const UserPassNewInvalid = () => err('The new password is invalid', 400);
export const UserPassNewNotNew = () => err('The new password has already been used', 400);

// description
export const QuizDescInvalid = () => err('The quiz description is too long', 400);

// author
export const QuizUnauthorised = (id: number) => err(`The quiz with ID '${id}' does not belong to you`, 403);

// token
export const InvalidToken = (token: string) => err(`The token '${token}' doesn't exist`, 401);
