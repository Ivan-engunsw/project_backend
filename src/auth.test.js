import { clear } from './other.js'
import { adminAuthRegister, adminQuizCreate, adminAuthLogin} from './auth.js'

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    // Reset state of data so tests can be run independently
    clear();
});

describe('adminAuthLogin', () => {
    let login;
    let auth;
    beforeEach(() => {
        auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
    })

    describe('Error Testing', () => {
        test('Email address does not exist', () => {
            login = adminAuthLogin('NotTheSame@gmail.com', 'password1!');
            expect(login).toStrictEqual(ERROR);
        });

        test('Password is not correct for the given email', () => {
           login = adminAuthLogin('validemail@gmail.com', 'wrongPword1!');
           expect(login).toStrictEqual(ERROR);
        });
    });

    describe('Functionality testing', () => {
        beforeEach(() => {
            login = adminAuthLogin('validemail@gmail.com', 'password1!');
        });
        
        test('Has the correct return type', () => {
            expect(login).toStrictEqual( {authUserId: expect.any(Number) } );
        });

        test('Successfully log in multiple users', () => {
            let login2 = adminAuthLogin('validemail2@gmail.com', 'password1!');
            
            expect(login).toStrictEqual( {authUserId: expect.any(Number) } );
            expect(login).not.toStrictEqual(login2);
        });
    });
});

