import { adminAuthRegister, adminAuthLogin, adminUserDetails } from '../auth';
import { clear } from '../other';

const ERROR = { errorMsg: expect.any(String), errorCode: expect.any(Number) };

beforeEach(() => {
  // Reset state of data so tests can be run independently
  clear();
});

describe('adminAuthLogin', () => {
  describe('Error Testing', () => {
    beforeEach(() => {
      adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
    });

    test('Email address does not exist', () => {
      const login = adminAuthLogin('NotTheSame@gmail.com', 'password1!');
      expect(login).toStrictEqual(ERROR);
    });

    test('Password is not correct for the given email', () => {
      const login = adminAuthLogin('validemail@gmail.com', 'wrongPword1!');
      expect(login).toStrictEqual(ERROR);
    });
  });

  describe('Functionality testing', () => {
    test('Has the correct return type', () => {
      adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
      const login = adminAuthLogin('validemail@gmail.com', 'password1!');
      expect(login).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('Successfully log in one users', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
      if ('errorMsg' in auth) {
        expect(auth).toStrictEqual(ERROR);
      } else {
        const login = adminAuthLogin('validemail@gmail.com', 'password1!');
        if ('errorMsg' in login) {
          expect(login).toStrictEqual(ERROR);
        } else {
          expect(login).toStrictEqual({ authUserId: auth.authUserId });
        }
      }
    });

    test('Successfully log in multiple users', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
      const auth2 = adminAuthRegister('validemail2@gmail.com', 'password1!', 'Ronaldo', 'Sui');

      if ('errorMsg' in auth) {
        expect(auth).toStrictEqual(ERROR);
      } else if ('errorMsg' in auth2) {
        expect(auth).toStrictEqual(ERROR);
      } else {
        const login = adminAuthLogin('validemail@gmail.com', 'password1!');
        if ('errorMsg' in login) {
          expect(login).toStrictEqual(ERROR);
        } else {
          expect(login).toStrictEqual({ authUserId: auth.authUserId });
        }

        const login2 = adminAuthLogin('validemail2@gmail.com', 'password1!');
        if ('errorMsg' in login2) {
          expect(login2).toStrictEqual(ERROR);
        } else {
          expect(login2).toStrictEqual({ authUserId: auth2.authUserId });
          expect(login).not.toStrictEqual(login2);
        }
      }
    });

    test('Successfully update numSuccessfullLogins', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
      if ('errorMsg' in auth) {
        expect(auth).toStrictEqual(ERROR);
      } else {
        const login = adminAuthLogin('validemail@gmail.com', 'password1!');
        if ('errorMsg' in login) {
          expect(login).toStrictEqual(ERROR);
        } else {
          const details = adminUserDetails(auth.authUserId);
          if ('errorMsg' in details) {
            expect(details).toStrictEqual(ERROR);
          } else {
            expect(details.user.numSuccessfulLogins).toStrictEqual(2);
          }
        }
      }
    });

    test('Successfully count numFailedPasswordsSinceLastLogin', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
      if ('errorMsg' in auth) {
        expect(auth).toStrictEqual(ERROR);
      } else {
        adminAuthLogin('validemail@gmail.com', 'wrongP1');
        const details = adminUserDetails(auth.authUserId);
        if ('errorMsg' in details) {
          expect(details).toStrictEqual(ERROR);
        } else {
          expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
        }
      }
    });
  });
});
