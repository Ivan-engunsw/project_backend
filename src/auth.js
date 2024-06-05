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
<<<<<<< HEAD
 * 
 * @param {number} authUserId - the user id of the author
 * @param {string} email  - email of the author
 * @param {string} nameFirst - the first name of the author
 * @param {string} nameLast  - the last name of the author
 * @returns {{}} - empty object
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
    return {

    }
=======
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
>>>>>>> 468abef776926b0470e15fa3f7a4bf7ca210a9e6
}