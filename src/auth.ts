import isEmail from 'validator/lib/isEmail';
import { getData, setData, Data } from './dataStore';

/**
 * Register a user with an email, password, and names, then returns their authUserId value.
 * @param {string} email - auth email
 * @param {string} password - auth password
 * @param {string} nameFirst - auth first name
 * @param {string} nameLast - auth last name
 *
 * @returns {{authUserId}} - return object
 */

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { authUserId: number } | { error: string } {
  const data: Data = getData();

  const regexName = /^[a-zA-Z' -]{2,20}$/;
  const regexPass = /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/;

  const isValidName = (name: string): boolean => regexName.test(name);
  const isValidPass = (pass: string): boolean => regexPass.test(pass);

  if (!isEmail(email)) { return { error: 'Invalid email' }; }
  if (data.users.some((user) => user.email === email)) { return { error: 'Email already registered' }; }

  if (!isValidName(nameFirst)) { return { error: 'Invalid first name' }; }
  if (!isValidName(nameLast)) { return { error: 'Invalid last name' }; }

  if (!isValidPass(password)) { return { error: 'Invalid password' }; }

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

export function adminAuthLogin(email: string, password: string): { authUserId: number } | { error: string } {
  const data = getData();
  const user = data.users.find((user) => email === user.email);

  if (!user) {
    return { error: 'Email does not exist' };
  }

  if (password !== user.password) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    return { error: 'Password is incorrect' };
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

export function adminUserDetails(authUserId: number): { user: object } | { error: string } {
  const dataStore = getData();

  const user = dataStore.users.find((user) => user.userId === authUserId);
  if (!user) {
    return { error: `authUserId = ${authUserId} not found` };
  }

  delete user.password;
  delete user.oldPwords;
  return { user };
}

/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 * @param {number} authUserId - the user id of the author
 * @param {string} email  - email of the author
 * @param {string} nameFirst - the first name of the author
 * @param {string} nameLast  - the last name of the author
 * @returns {{}} - empty object
 */
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): Record<string, never> | { error: string} {
  const dataStore = getData();
  const user = dataStore.users.find((user) => user.userId === authUserId);

  // Conditions for checking if the input is correct
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (dataStore.users.some(user => user.email === email && user.userId !== authUserId)) {
    return { error: 'Email is currently used by another user.' };
  }
  if (!isEmail(email)) {
    return { error: 'Email does not satisfy validator.isEmail.' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(nameFirst)) {
    return { error: 'NameFirst contains invalid characters.' };
  }
  if (nameFirst.length < 2) {
    return { error: 'NameFirst is less than 2 characters.' };
  }
  if (nameFirst.length > 20) {
    return { error: 'NameFirst is more than 20 characters.' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(nameLast)) {
    return { error: 'NameLast contains invalid characters.' };
  }
  if (nameLast.length < 2) {
    return { error: 'NameLast is less than 2 characters.' };
  }
  if (nameLast.length > 20) {
    return { error: 'NameLast is more than 20 characters.' };
  }

  // Updating the user details
  user.email = email;
  user.name = nameFirst + ' ' + nameLast;
  setData(dataStore);

  return {
  };
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * @param {number} authUserId - the user id of the author
 * @param {string} oldPassword - the old password of the author
 * @param {string} newPassword - the new password of the author
 * @returns {{}} -empty object
 */
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): Record<string, never> | { error: string } {
  const dataStore = getData();
  const user = dataStore.users.find((user) => user.userId === authUserId);

  // Conditions for checking if the input is correct
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  if (user.password !== oldPassword) {
    return { error: 'Old Password is not the correct old password.' };
  }
  if (oldPassword === newPassword) {
    return { error: 'Old Password and New Password match exactly.' };
  }
  if (user.oldPwords && user.oldPwords.includes(newPassword)) {
    return { error: 'New Password has already been used before by this user.' };
  }
  if (newPassword.length < 8) {
    return { error: 'New Password is less than 8 characters.' };
  }
  if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
    return { error: 'New Password does not contain at least one number and at least one letter.' };
  }

  // Updating the Password
  user.password = newPassword;
  user.oldPwords = user.oldPwords || [];
  user.oldPwords.push(oldPassword);
  setData(dataStore);

  return {};
}
