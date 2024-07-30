import { State, getData, setData } from "./dataStore";
import { findSessionsByQuizId, generateId, getQuizById } from "./helper";
import * as error from './errors'

export function adminQuizSessionStart(quizId: number, autoStartNum: number) {
    // Check the autoStartNum
    if (autoStartNum > 50 ) {
        throw new Error(error.invalidAutoStartNum(autoStartNum));
    }

    const data = getData();

    // Check there aren't already 10 sessions
    if (findSessionsByQuizId(data, quizId).length === 10) {
        throw new Error(error.tooManySessions(quizId));
    }

    // Check the quiz is not in the trash
    if (data.trash.find(quiz => quiz.quizId === quizId)) {
        throw new Error(error.quizInTrash(quizId));
    }

    // Retrieve the metadata
    const quiz = getQuizById(data, quizId);

    // Check the quiz has questions
    if (quiz.questions.length === 0) {
        throw new Error(error.noQuestions(quizId));
    }

    // Generate sessionId
    let sessionId: number;
    do {
        sessionId = generateId('number') as number;
    } while (data.sessions.find(session => session.sessionId === sessionId));

    // Create the session and setData
    data.sessions.push({
        sessionId: sessionId,
        autoStartNum: autoStartNum,
        state: State.LOBBY,
        atQuestion: 0,
        players: [],
        metadata: quiz,
        questionResults: [],
        usersRankedByScore: [],
        messages: [],
    });
    setData(data);

    return { sessionId: sessionId };
}