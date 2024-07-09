import { clear } from '../other';
import { adminQuizCreate, adminQuizTransfer } from '../quiz';
import { adminAuthRegister } from '../auth';

beforeEach(() => {
    clear();
});

describe('adminQuizTransfer', () => {
    let authUser: { authUserId: number };
    let quiz: { quizId: number };
    beforeEach(() => {
      authUser = adminAuthRegister('betty@unsw.com', 'password1', 'Betty', 'Boop');
      adminAuthRegister('norman@unsw.com', 'password1', 'Norman', 'Nile');
      quiz = adminQuizCreate(authUser.authUserId, 'Quiz1', 'Betty\'s quiz');
    });

    describe('functionality testing', () => {
        test('has the correct return type', () => {
            expect(adminQuizTransfer(authUser.authUserId, 'norman@unsw.com')).toStrictEqual({});
        });
    });
});