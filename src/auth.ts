import { getData, Data } from './dataStore';
import { errEmailInvalid, errEmailNotFound, errEmailTaken, errFirstNameInvalid, errLastNameInvalid, errUserIdNotFound, errUserPassCurrIncorrect, errUserPassCurrInvalid, errUserPassNewInvalid, errUserPassNewNotNew, errUserPassOldIncorrect } from './errors';
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

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { authUserId: number } | { error: string, errorCode: number } {
  const data: Data = getData();

  if (!validEmail(email)) { return errEmailInvalid(email); }
  if (takenEmail(data, email)) { return errEmailTaken(email); }
  if (!validUserName(nameFirst)) { return errFirstNameInvalid(nameFirst); }
  if (!validUserName(nameLast)) { return errLastNameInvalid(nameLast); }
  if (!validUserPass(password)) { return errUserPassCurrInvalid(); }

  const authUserId: number = data.users.length;
  data.users.push({
    userId: authUserId,
    name: nameFirst + ' ' + nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  });

  return { authUserId: authUserId };
}

/**
* Given a registered user's email and password returns their authUserId value.
* @param {string} email - auth email
* @param {string} password - auth password
*
* @returns {{authUserId}} - return object
*/

export function adminAuthLogin(email: string, password: string): { authUserId: number } | { error: string, errorCode: number } {
  const data = getData();
  const user = getUserByEmail(data, email);
  if (!user) { return errEmailNotFound(email); }

  if (password !== user.password) {
    user.numFailedPasswordsSinceLastLogin++;
    return errUserPassCurrIncorrect();
  }

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;

  return { authUserId: user.userId };
}

/**
 * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
 * @param {number} authUserId - auth email
 *
 * @returns {{user}} - return object
 */

export function adminUserDetails(authUserId: number): { user: object } | { error: string, errorCode: number } {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

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
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): Record<string, never> | { error: string, errorCode: number } {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  const userWithEmail = getUserByEmail(data, email);
  if (userWithEmail && userWithEmail.userId !== authUserId) { return errEmailTaken(email); }

  // Conditions for checking if the input is correct
  if (!validEmail(email)) { return errEmailInvalid(email); }
  if (!validUserName(nameFirst)) { return errFirstNameInvalid(nameFirst); }
  if (!validUserName(nameLast)) { return errLastNameInvalid(nameLast); }

  // Updating the user details
  user.email = email;
  user.name = nameFirst + ' ' + nameLast;

  return {};
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * @param {number} authUserId - the user id of the author
 * @param {string} oldPassword - the old password of the author
 * @param {string} newPassword - the new password of the author
 * @returns {{}} -empty object
 */
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): Record<string, never> | { error: string, errorCode: number } {
  const data = getData();

  const user = getUserById(data, authUserId);
  if (!user) { return errUserIdNotFound(authUserId); }

  // Conditions for checking if the input is correct
  if (user.password !== oldPassword) { return errUserPassOldIncorrect(); }
  if (oldPassword === newPassword) { return errUserPassNewNotNew(); }
  if (user.oldPwords && user.oldPwords.includes(newPassword)) { return errUserPassNewNotNew(); }
  if (!validUserPass(newPassword)) { return errUserPassNewInvalid(); }

  // Updating the Password
  (user.oldPwords) ? user.oldPwords.push(oldPassword) : user.oldPwords = [oldPassword];
  user.password = newPassword;

  return {};
}
