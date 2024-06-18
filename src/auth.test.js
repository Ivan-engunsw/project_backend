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

        expect(login.numFailedPasswordsSinceLastLogin).toStrictEqual( {} );
    });

    describe('Functionality testing', () => {
        beforeEach(() => {
            login = adminAuthLogin('validemail@gmail.com', 'password1!');
        });
        
        test('Has the correct return type', () => {
            expect(login).toStrictEqual( {authUserId: expect.any(Number) } );
        });

        test('Successfully log in multiple users', () => {
            let auth2 = adminAuthRegister('validemail2@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            let login2 = adminAuthLogin('validemail2@gmail.com', 'password1!');
            
            expect(login).toStrictEqual( {authUserId: expect.any(Number) } );
            expect(login).not.toStrictEqual(login2);
        });

        /*test('Successfully count numSuccessfullLogins', () => {
            expect(login).toStrictEqual();
        });

        test('Successfully updates numFailedPasswords', () => {
            let auth3 = adminAuthRegister('validemail3@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            let login3 = adminAuthLogin('validemail3@gmail.com', 'wrongPword1');
            expect(login3.numSuccessfulLogins);
        });*/
    });
});

