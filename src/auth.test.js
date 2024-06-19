import { clear } from './other.js'
import { adminAuthRegister, adminAuthLogin} from './auth.js'

const ERROR = { error: expect.any(String) };

describe('adminAuthLogin', () => {
    let login;
    let auth;
    
    describe('Error Testing', () => {
        beforeEach(() => {
            auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            clear();
        })

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
            auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            login = adminAuthLogin('validemail@gmail.com', 'password1!');
            clear();
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

        test('Successfully count numFailedPasswordsSinceLastLogin', () => {
            expect(login.numFailedPasswordsSinceLastLogin).toStrictEqual( {} );
        });

        test('Successfully updates numFailedPasswords', () => {
            let auth3 = adminAuthRegister('validemail3@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            let login3 = adminAuthLogin('validemail3@gmail.com', 'wrongPword1');
            expect(login3.numSuccessfulLogins);
        });*/
    });
});

