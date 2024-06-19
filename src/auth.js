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

function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
      authUserId: 1,
    }
}

/**
* Given a registered user's email and password returns their authUserId value.
* @param {string} email - auth email
* @param {string} password - auth password
* 
* @returns {{authUserId}} - return object
*/

export function adminAuthLogin(email, password) {
  let data = getData();
    
  if (!data.users.some((user) => email === user.email)) 
    return { error: 'Email does not exist' }
  
  if (password !== data.users.user.password) {
    data.users.user.push({
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin++,
    })
    return {error: 'Password is incorrect'}
  }

  data.users.user.push({
    numFailedPasswordsSinceLastLogin: 0,
    numSuccessfulLogins: user.numSuccessfulLogins++,
  });

  setData(data);

  return { authUserId: user.authUserId }
}

/**
 * Given an admin user's authUserId, return details about the user.
    "name" is the first and last name concatenated with a single space between them.
 * @param {number} authUserId - auth email
 * 
 * @returns {{user}} - return object
 */

function adminUserDetails(authUserId) {
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
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
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
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {

  }
}