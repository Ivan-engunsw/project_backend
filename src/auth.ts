import { getData, setData, Data, User, EmptyObject } from './dataStore';
import * as error from './errors';
import { getUserByEmail, getUserById, takenEmail, validEmail, validUserName, validUserPass } from './helper';

/**
 * Register a user with an email, password, and names, then returns their authUserId value.
 * @param {string} email - auth email
 * @param {string} password - auth password
 * @param {string} nameFirst - auth first name
 * @param {string} nameLast - auth last name
 *
 * @returns {{authUserId}} - return object
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string,
  nameLast: string): { authUserId: number } | error.ErrorObject {
  const data: Data = getData();

  if (!validEmail(email)) { return error.EmailInvalid(email); }
  if (takenEmail(data, email)) { return error.EmailTaken(email); }
  if (!validUserName(nameFirst)) { return error.FirstNameInvalid(nameFirst); }
  if (!validUserName(nameLast)) { return error.LastNameInvalid(nameLast); }
  if (!validUserPass(password)) { return error.UserPassCurrInvalid(); }

  const authUserId: number = data.users.length;
  data.users.push({
    userId: authUserId,
    name: nameFirst + ' ' + nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  });

  setData(data);

  return { authUserId: authUserId };
}

/**
* Given a registered user's email and password returns their authUserId value.
* @param {string} email - auth email
* @param {string} password - auth password
*
* @returns {{authUserId}} - return object
*/
export function adminAuthLogin(email: string, password: string): { authUserId: number } | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserByEmail(data, email);
  if (!user) { return error.EmailNotFound(email); }

  if (password !== user.password) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    return error.UserPassCurrIncorrect();
  }

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  setData(data);

  return { authUserId: user.userId };
}

/**
 * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
 * @param {number} authUserId - auth email
 *
 * @returns {{user}} - return object
 */

export function adminUserDetails(authUserId: number): { user: Omit<User, 'password' | 'oldPwords' > } | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const { password, oldPwords, ...filtered } = user;

  return { user: filtered };
}

/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 * @param {number} authUserId - the user id of the author
 * @param {string} email  - email of the author
 * @param {string} nameFirst - the first name of the author
 * @param {string} nameLast  - the last name of the author
 * @returns {{}} - empty object
 */
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  const userWithEmail: User = getUserByEmail(data, email);
  if (userWithEmail && userWithEmail.userId !== authUserId) { return error.EmailTaken(email); }

  // Conditions for checking if the input is correct
  if (!validEmail(email)) { return error.EmailInvalid(email); }
  if (!validUserName(nameFirst)) { return error.FirstNameInvalid(nameFirst); }
  if (!validUserName(nameLast)) { return error.LastNameInvalid(nameLast); }

  // Updating the user details
  user.email = email;
  user.name = nameFirst + ' ' + nameLast;

  setData(data);

  return {};
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * @param {number} authUserId - the user id of the author
 * @param {string} oldPassword - the old password of the author
 * @param {string} newPassword - the new password of the author
 * @returns {{}} -empty object
 */
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): EmptyObject | error.ErrorObject {
  const data: Data = getData();

  const user: User = getUserById(data, authUserId);
  if (!user) { return error.UserIdNotFound(authUserId); }

  // Conditions for checking if the input is correct
  if (user.password !== oldPassword) { return error.UserPassOldIncorrect(); }
  if (oldPassword === newPassword) { return error.UserPassNewNotNew(); }
  if (user.oldPwords && user.oldPwords.includes(newPassword)) { return error.UserPassNewNotNew(); }
  if (!validUserPass(newPassword)) { return error.UserPassNewInvalid(); }

  // Updating the Password
  (user.oldPwords) ? user.oldPwords.push(oldPassword) : user.oldPwords = [oldPassword];
  user.password = newPassword;

  setData(data);

  return {};
}
