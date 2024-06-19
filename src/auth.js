import isEmail from 'validator/lib/isEmail';
import { getData, setData } from './dataStore.js'

/**
 * Register a user with an email, password, and names, then returns their authUserId value.
 * @param {string} email - auth email
 * @param {string} password - auth password
 * @param {string} nameFirst - auth first name
 * @param {string} nameLast - auth last name
 * 
 * @returns {{authUserId}} - return object
 */

export function adminAuthRegister(email, password, nameFirst, nameLast) {
  let data = getData();
  
  let regexName = /^[a-zA-Z' -]{2,20}$/
  let regexPass = /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/

  let isValidName = (name) => regexName.test(name);
  let isValidPass = (pass) => regexPass.test(pass);
  
  if (!isEmail(email))
    return { error: 'Invalid email' }
  if (data.users.some((user) => user.email === email))
    return { error: 'Email already registered' };
  
  if (!isValidName(nameFirst))
    return { error: 'Invalid first name' }
  if (!isValidName(nameLast))
    return { error: 'Invalid last name' }

  if (!isValidPass(password)) 
    return { error: 'Invalid password' }


  let authUserId = data.users.length;
  data.users.push({
    userId: authUserId,
    name: nameFirst + ' ' + nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  });

  setData(data);
  
  return { authUserId: authUserId }
}


/**
* Given a registered user's email and password returns their authUserId value.
* @param {string} email - auth email
* @param {string} password - auth password
* 
* @returns {{authUserId}} - return object
*/

export function adminAuthLogin(email, password) {
 return {
   authUserId: 1,
 }
}

/**
 * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
 * @param {number} authUserId - auth email
 * 
 * @returns {{user}} - return object
 */

export function adminUserDetails(authUserId) {
  return { user:
    {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  };
}

/**
 * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
 * @param {number} authUserId - the user id of the author
 * @param {string} email  - email of the author
 * @param {string} nameFirst - the first name of the author
 * @param {string} nameLast  - the last name of the author
 * @returns {{}} - empty object
 */
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  return {

  }
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * @param {number} authUserId - the user id of the author
 * @param {string} oldPassword - the old password of the author
 * @param {string} newPassword - the new password of the author
 * @returns {{}} -empty object 
 */
export function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {

  }
}