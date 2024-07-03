import { clear } from './other.js';
import { adminAuthRegister, adminAuthLogin, adminUserDetails } from './auth.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  // Reset state of data so tests can be run independently
  clear();
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
      expect(login).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('Successfully log in multiple users', () => {
      auth2 = adminAuthRegister('validemail2@gmail.com', 'password1!', 'Ronaldo', 'Sui');
      login2 = adminAuthLogin('validemail2@gmail.com', 'password1!');

      expect(login).toStrictEqual({ authUserId: auth.authUserId });
      expect(login).not.toStrictEqual(login2);
      expect(login2).toStrictEqual({ authUserId: auth2.authUserId });
    });

    test('Successfully count numSuccessfullLogins', () => {
      expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    });

    test('Successfully count numFailedPasswordsSinceLastLogin', () => {
      login = adminAuthLogin('validemail@gmail.com', 'wrongP!');
      details = adminUserDetails(auth.authUserId);
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });
  });
});
