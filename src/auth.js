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

function adminAuthLogin(email, password) {
  return {
    authUserId: 1,
  }
}