// error
const err = (str: string) => ({ error: str });

// id
export const errUserIdNotFound = (id: number) => err(`The user ID '${id}' was not found`);
export const errQuizIdNotFound = (id: number) => err(`The quiz ID '${id}' was not found`);

// email
export const errEmailInvalid = (email: string) => err(`The email '${email}' is invalid`);
export const errEmailTaken = (email: string) => err(`The email '${email}' is already registered`);
export const errEmailNotFound = (email: string) => err(`The email '${email}' is not registered`);

// name
export const errFirstNameInvalid = (Fname: string) => err(`The first name '${Fname}' is invalid`);
export const errLastNameInvalid = (Lname: string) => err(`The last name '${Lname}' is invalid`);
export const errQuizNameInvalid = (Qname: string) => err(`The quiz name '${Qname}' is invalid`);
export const errQuizNameTaken = (Qname: string) => err(`The quiz name '${Qname}' is already in use`);

// password
export const errUserPassCurrInvalid = () => err('The password is invalid');
export const errUserPassCurrIncorrect = () => err('The password is incorrect');
export const errUserPassOldIncorrect = () => err('The old password is incorrect');
export const errUserPassNewInvalid = () => err('The new password is invalid');
export const errUserPassNewNotNew = () => err('The new password has already been used');

// description
export const errQuizDescInvalid = () => err('The quiz description is too long');

// author
export const errQuizUnauthorised = (id: number) => err(`The quiz with ID '${id}' does not belong to you`);
