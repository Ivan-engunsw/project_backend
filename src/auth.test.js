import { clear } from './other.js'
import { adminAuthRegister, adminAuthLogin, adminUserDetails} from './auth.js'

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    // Reset state of data so tests can be run independently
    clear();
});

describe('adminAuthRegister', () => {

    describe('Error Testing', () => {
        test('email address is used by another user', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui')
            let auth2 = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob')
            expect(auth2).toStrictEqual(ERROR);
        });

        test('email address is invalid', () => {
            let auth = adminAuthRegister('invalidEmail', 'password1!', 'Ronaldo', 'Sui');
            expect(auth).toStrictEqual(ERROR)
        });

        test('nameFirst contains invalid characters', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', '!@#$', 'Sui');
            expect(auth).toStrictEqual(ERROR)
        });

        test('nameFirst < 2 char or nameFirst > 20 char', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'A', 'Sui');
            let auth2 = adminAuthRegister('valid.email.2@gmail.com', 'password1!',
                                          'Abcdefghijklmnopqrstu', 'Sui');
            expect(auth).toStrictEqual(ERROR);
            expect(auth2).toStrictEqual(ERROR);
        });

        test('nameLast contains invalid characters', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Sui', '!@#$');
            expect(auth).toStrictEqual(ERROR)
        });

        test('nameLast < 2 char or nameLast > 20 char', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Sui', 'A');
            let auth2 = adminAuthRegister('valid.email.2@gmail.com', 'password1!',
                                          'Sui', 'Abcdefghijklmnopqrstu');
            expect(auth).toStrictEqual(ERROR);
            expect(auth2).toStrictEqual(ERROR);
        });

        test('password < 8 char', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'f1', 'Ronaldo', 'Sui');
            expect(auth).toStrictEqual(ERROR);
        });

        test('passord does not have at least one number and one letter', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'IamEight', 'Ronaldo', 'Sui');
            let auth2 = adminAuthRegister('validemail@gmail.com', '12345678', 'Ronaldo', 'Sui');
            let auth3 = adminAuthRegister('validemail@gmail.com', '!!!!!!!!', 'Ronaldo', 'Sui');
            let auth4 = adminAuthRegister('validemail@gmail.com', '', 'Ronaldo', 'Sui');

            expect(auth).toStrictEqual(ERROR);
            expect(auth2).toStrictEqual(ERROR);
            expect(auth3).toStrictEqual(ERROR);
            expect(auth4).toStrictEqual(ERROR);
        });
    });

    describe('Functionality Testing', () => {
        test('Has the correct return type', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            expect(auth).toStrictEqual( { authUserId: expect.any(Number) } )
        });

        test('successfully register 2 unique userIds', () => {
            let auth5 = adminAuthRegister('validemail5@gmail.com', 'password1!', 'Bobby', 'Bob');
            let auth6 = adminAuthRegister('validemail6@gmail.com', 'password1!', 'Bobby', 'Bob');
            expect(auth5).toStrictEqual( { authUserId: expect.any(Number) } );
            expect(auth5.authUserId).not.toStrictEqual(auth6.authUserId);
        });        

        test('successfully update numSuccessfulLogins', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
            let details = adminUserDetails(auth.authUserId);
            expect(details.user.numSuccessfulLogins).toStrictEqual(1);
        });

        test('successfully create numFailedPasswordsSinceLastLogin', () => {
            let auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
            let details = adminUserDetails(auth.authUserId);
            expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
        });
    });
});

describe('adminAuthLogin', () => {
    let login;
    let login2;
    let auth;
    let auth2;
    let details;
    
    describe('Error Testing', () => {
        beforeEach(() => {
            clear();
            auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
        });

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
            clear();
            auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            login = adminAuthLogin('validemail@gmail.com', 'password1!');
            details = adminUserDetails(auth.authUserId);
        });
        
        test('Has the correct return type', () => {
            expect(login).toStrictEqual( { authUserId: expect.any(Number) } );
        });

        test('Successfully log in multiple users', () => {
            auth2 = adminAuthRegister('validemail2@gmail.com', 'password1!', 'Ronaldo', 'Sui');
            login2 = adminAuthLogin('validemail2@gmail.com', 'password1!');
            
            expect(login).toStrictEqual( { authUserId: expect.any(Number) } );
            expect(login).not.toStrictEqual(login2);
        });

        test('Successfully count numSuccessfullLogins', () => {
            expect(details.user.numSuccessfulLogins).toStrictEqual(2);
        });

        test('Successfully count numFailedPasswordsSinceLastLogin', () => {
            login = adminAuthLogin('validemail@gmail.com', 'wrongP!');
            expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
        });
    });
});