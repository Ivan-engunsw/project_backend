// id
export const errUserIdNotFound = id => ({ error: `The user ID '${id}' was not found` });
export const errQuizIdNotFound = id => ({ error: `The quiz ID '${id}' was not found` });

// email
export const errEmailInvalid = email => ({ error: `The email '${email}' is invalid` });
export const errEmailTaken = email => ({ error: `The email '${email}' is already registered` });
export const errEmailNotFound = email => ({ error: `The email '${email}' is not registered` });

// name
export const errFirstNameInvalid = Fname => ({ error: `The first name '${Fname}' is invalid` });
export const errLastNameInvalid = Lname => ({ error: `The last name '${Lname}' is invalid` });
export const errQuizNameInvalid = name => ({ error: `The quiz name '${name}' is invalid` });
export const errQuizNameTaken = name => ({ error: `The quiz name '${name}' is already in use` });

// password
export const errUserPassCurrInvalid = () => ({ error: 'The password is invalid' });
export const errUserPassCurrIncorrect = () => ({ error: 'The password is incorrect' });
export const errUserPassOldIncorrect = () => ({ error: 'The old password is incorrect' });
export const errUserPassNewInvalid = () => ({ error: 'The new password is invalid' });
export const errUserPassNewNotNew = () => ({ error: 'The new password has already been used' });

// description
export const errQuizDescInvalid = () => ({ error: 'The quiz description is too long' });

// author
export const errQuizUnauthorised = id => ({ error: `The quiz with ID '${id}' does not belong to you` });
