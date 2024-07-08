// error
const err = (str: string, code: number) => ({ error: str, errorCode: code });

// id
export const errUserIdNotFound = (id: number) => err(`The user ID '${id}' was not found`, 400);
export const errQuizIdNotFound = (id: number) => err(`The quiz ID '${id}' was not found`, 403);

// email
export const errEmailInvalid = (email: string) => err(`The email '${email}' is invalid`, 400);
export const errEmailTaken = (email: string) => err(`The email '${email}' is already registered`, 400);
export const errEmailNotFound = (email: string) => err(`The email '${email}' is not registered`, 400);

// name
export const errFirstNameInvalid = (Fname: string) => err(`The first name '${Fname}' is invalid`, 400);
export const errLastNameInvalid = (Lname: string) => err(`The last name '${Lname}' is invalid`, 400);
export const errQuizNameInvalid = (Qname: string) => err(`The quiz name '${Qname}' is invalid`, 400);
export const errQuizNameTaken = (Qname: string) => err(`The quiz name '${Qname}' is already in use`, 400);

// password
export const errUserPassCurrInvalid = () => err('The password is invalid', 400);
export const errUserPassCurrIncorrect = () => err('The password is incorrect', 400);
export const errUserPassOldIncorrect = () => err('The old password is incorrect', 400);
export const errUserPassNewInvalid = () => err('The new password is invalid', 400);
export const errUserPassNewNotNew = () => err('The new password has already been used', 400);

// description
export const errQuizDescInvalid = () => err('The quiz description is too long', 400);

// author
export const errQuizUnauthorised = (id: number) => err(`The quiz with ID '${id}' does not belong to you`, 403);
