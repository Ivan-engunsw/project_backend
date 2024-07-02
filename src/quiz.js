import {getData, setData} from './dataStore.js';

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - authorised user Id
 * @returns {{quizzes}} - object containing quizId and name
 */
export function adminQuizList(authUserId) {

    const currentAuthorisedUsers = getData().users;

    let authUser = currentAuthorisedUsers.find(a => a.userId === authUserId);

    if (authUser === undefined) {
        return { error: 'The authUserId is not a valid user'};
    }

    const currentQuizzes = getData().quizzes;

    let quizList = [];

    for (const quiz of currentQuizzes) {
        if (quiz.userId === authUserId) {
            quizList.push({
                quizId: quiz.quizId,
                name: quiz.name,
            });
        }
    }

    return { quizzes: quizList};
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

    let dataStore = getData();

    const currentAuthorisedUsers = dataStore.users;

    let authUser = currentAuthorisedUsers.find(a => a.userId === authUserId);

    if (authUser === undefined) {
        return { error: 'UserId is invalid'};
    }

    if (name.length < 3 || name.length > 30) {
        return { error: 'The length of the name of the quiz is invalid'};
    }

    let regexName = /^[a-zA-Z0-9_ ]*$/;
    if (!(regexName.test(name))) {
        return { error: 'The name contains invalid characters'};
    }

    let quizzes = dataStore.quizzes;

    let quizWithSameName = quizzes.find(a => a.name === name && a.userId === authUserId);

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

    quizzes.push(quizCreated);
    setData(dataStore);

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
export function adminQuizRemove(authUserId, quizId) {
    const data = getData();

    if (!data.users.find(user => user.userId === authUserId))
        return { error: "Invalid author ID" };

    const i = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (i === -1) return { error: "Invalid quiz ID" };
    
    if (data.quizzes[i].userId !== authUserId)
        return { error: "Unauthorised access to quiz" };

    data.quizzes.splice(i, 1);

    setData(data);

    return {};
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @returns {{quizInfo}} - return object
 */
export function adminQuizInfo(authUserId, quizId) {
    const data = getData();

    if (!data.users.find(user => user.userId === authUserId))
        return { error: "Invalid author ID" };

    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) return { error: "Invalid quiz ID" };
    
    if (quiz.userId !== authUserId)
        return { error: "Unauthorised access to quiz" };

    const { userId, ...filtered } = quiz

    return filtered;
}

/**
 * Update the name of the relevant quiz.
 * 
 * @param {number} authUserId - authorised user Id
 * @param {number} quizId - quiz Id
 * @param {string} name - new name of quiz
 * @returns {{}} - empty object
 */
export function adminQuizNameUpdate(authUserId, quizId, name) {
    // Check the name provided
    let regexName = /^[a-zA-Z0-9 ]{3,30}$/
    if(!(regexName.test(name))) {
        return { error: `${name} is not alphanumeric`};
    }

    let dataStore = getData();

    // Check the user exists
    let user = dataStore.users.find((user) => user.userId === authUserId);
    if (!user) {
        return { error: `authUserId = ${authUserId} not found` };
    }

    // Check the quiz exists
    let quiz = dataStore.quizzes.find((quiz) => quiz.quizId === quizId);
    if (!quiz) {
        return { error: `quizId = ${quizId} not found` };
    }

    // Check the quiz belongs to the user
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
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
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
export function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    // Check the description provided
    if (description.length > 100) {
        return { error: `description is too long` };
    }

    let dataStore = getData();

    // Check the user exists
    let user = dataStore.users.find((user) => user.userId === authUserId);
    if (!user) {
        return { error: `authUserId = ${authUserId} not found` };
    }

    // Check the quiz exists
    let quiz = dataStore.quizzes.find((quiz) => quiz.quizId === quizId);
    if (!quiz) {
        return { error: `quizId = ${quizId} not found` };
    }

    // Check the quiz belongs to the user
    if (quiz.userId != authUserId) {
        return { error: `quizId = ${quizId} does not belong to you` };
    }

    // Update the description of the quiz and return
    quiz.description = description;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
    setData(dataStore);
    return { };
}
