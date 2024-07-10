import { clear } from '../other';
import { adminQuizCreate, adminQuizQuestionCreate } from '../quiz';
import { adminAuthRegister } from '../auth';

beforeEach(() => {
    clear();
});

describe('adminQuizQuestionCreate', () => {
    let authUser;
    let quiz;
    beforeEach(() => {
      authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
      quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Betty\'s quiz');
    });

    describe('functionality testing', () => {
        test('has the correct return type', () => {
            const questionBody = {
                question: 'Who is the Monarch of England?',
                duration: 4,
                points: 5,
                answers: [
                    {
                        answer: 'Prince Charles',
                        correct: true,
                    },
                    {
                        answer: 'Queen Elizabeth',
                        correct: false,
                    },
                ],
            };
            expect(adminQuizQuestionCreate(authUser.authUserId, quiz.quizId, questionBody)).toStrictEqual({ questionId: expect.any(Number) });
        });
    });
});