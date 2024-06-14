import {getData, setData} from './dataStore.js';

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
export function adminQuizCreate(authUserId, name, description) {

    const currentAuthorisedUsers = getData().users;

    let authUser = currentAuthorisedUsers.find(a => a.userId === authUserId);

    if (authUser === undefined) {
        return { error: 'UserId is invalid'};
    }

    if (name.length < 3 || name.length > 30) {
        return { error: 'The length of the name of the quiz is invalid'};
    }

    for (let character of name) {
        let ascii = name.charCodeAt(name.indexOf(character));
        if (ascii === 32 || (ascii >= 48 && ascii <= 57) || (ascii >= 65 && ascii <= 90) || (ascii >= 97 && ascii <= 122)) {
            continue;
        } else {
            return { error: 'The name contains invalid characters'};
        }
    }

    const quizzes = getData().quizzes;

    let quizWithSameName = quizzesByCurrentUser.find(a => a.name === name && a.authUserId === authUserId);

    if (quizWithSameName !== undefined) {
        return { error: 'The name is already used for another quiz by the same user'};
    }

    if (description.length > 100) {
        return { error: 'The description should be shorter than 100 characters'};
    }

    let quizCreated = {
        quizId: quizzes.length,
        userId: authUserId,
        name: name,
        description: description,
        timeCreated: Math.floor(Date.now() / 1000),
        timeLastEdited: Math.floor(Date.now() / 1000),
    }

    getData().quizzes.push(quizCreated);

    return {
        quizId: quizCreated.quizId,
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
    return {
    };
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