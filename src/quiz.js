/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
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
 * 
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
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @returns {{}} - return object
 */
function adminQuizRemove(authUserId, quizId) {
    return {};
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @returns {{quizInfo}} - return object
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

/**
 * Update the name of the relevant quiz.
 * 
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @param {string} name - new name of quiz
 * @returns {{}} - empty object
 */
function adminQuizNameUpdate(authUserId, quizId, name) {
    // Check the name provided
    if (name.length < 3 || name.length > 30) {
        return { error: `${name} is of invalid length` };
    }

    for (let char of name) {
        if ( !((char > 'a' && char < 'z') || (char > 'A' && char < 'Z') || (char > '0' && char < '9')) ) {
            return { error: `${name} is not alphanumeric` }
        }
    }

    let dataStore = getdata();

    // Check the user exists
    let user = dataStore.users.find((user) => user.userId === authUserId);
    if (!user) {
        return { error: `authUserId = ${autherUserId} not found` };
    }

    // Check the quiz exists
    let quiz = dataStore.quizzes.find((quiz) => quiz.quizId === quizId);
    if (!quiz) {
        return { error: `quizId = ${quizId} not found` };
    }

    // Check the quiz belonds to the user
    if (quiz.userId != authUserId) {
        return { error: `quizId = ${quizId} does not belong to you` };
    }

    // Check if the user has another quiz with the same name
    let userQuizzes = dataStore.quizzes.filter((quiz) => quiz.userId === authUserId);
    for (let userQuiz of userQuizzes) {
        if (userQuiz.name === name) {
            return { error: `${name} is already in use by you` };
        }
    }

    // Update the name of the quiz and return
    quiz.name = name;
    setData(dataStore);
    return { };
}

/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @param {string} description - new description of quiz
 * @returns {{}} - empty object
 */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    return {
    };
}