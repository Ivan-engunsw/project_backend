/**
 * Given a particular quiz, permanently remove the quiz.
 * @param {integer} authUserId 
 * @param {integer} quizId 
 * @returns {object}
 */
function adminQuizRemove(authUserId, quizId) {
    return {};
}

/**
 * Get all of the relevant information about the current quiz.
 * @param {integer} authUserId 
 * @param {integer} quizId 
 * @returns {object}
 */
function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    }
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