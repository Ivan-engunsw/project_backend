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