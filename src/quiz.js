/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * @param {number} authUserId - authorised user Id
 * @returns {{quizzes}} - object containing quizId and name
 */
function adminQuizList(authUserId) {
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
    }
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * @param {number} authUserId - authorised user id
 * @param {string} name - new name of quiz
 * @param {string} description - description about the quiz
 * @returns {{quizId}} - object containing quizId
 */
function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    }
}

/**
 * Update the name of the relevant quiz.
 * Given a particular quiz, permanently remove the quiz.
 * @param {integer} authUserId 
 * @param {integer} quizId 
 * @returns {object}
 */
function adminQuizRemove(authUserId, quizId) {
    return {};
}

/** Update the name of the relevant quiz.
 *
 * @param {int} authUserId - authorised user Id
 * @param {int} quizId - quiz Id
 * @param {string} name - new name of quiz
 * @returns {{}} - empty object
 */
function adminQuizNameUpdate(authUserId, quizId, name) {
    return {
    };
}

/**
 * Update the description of the relevant quiz.
 * 
 * @param {int} authUserId - authorised user Id
 * @param {int} quizId - quiz Id
 * @param {string} description - new description of quiz
 * @returns {{}} - empty object
 */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    return {
    };
}