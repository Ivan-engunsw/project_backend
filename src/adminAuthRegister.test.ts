import { adminAuthRegister, adminUserDetails } from './auth';
import { clear } from './other';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

describe('adminAuthRegister', () => {
  describe('Error Testing', () => {
    test('email address is used by another user', () => {
      adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
      const auth2 = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
      expect(auth2).toStrictEqual(ERROR);
    });

    test('email address is invalid', () => {
      const auth = adminAuthRegister('invalidEmail', 'password1!', 'Ronaldo', 'Sui');
      expect(auth).toStrictEqual(ERROR);
    });

    test('nameFirst contains invalid characters', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', '!@#$', 'Sui');
      expect(auth).toStrictEqual(ERROR);
    });

    test('nameFirst < 2 char or nameFirst > 20 char', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'A', 'Sui');
      const auth2 = adminAuthRegister('valid.email.2@gmail.com', 'password1!',
        'Abcdefghijklmnopqrstu', 'Sui');
      expect(auth).toStrictEqual(ERROR);
      expect(auth2).toStrictEqual(ERROR);
    });

    test('nameLast contains invalid characters', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Sui', '!@#$');
      expect(auth).toStrictEqual(ERROR);
    });

    test('nameLast < 2 char or nameLast > 20 char', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Sui', 'A');
      const auth2 = adminAuthRegister('valid.email.2@gmail.com', 'password1!',
        'Sui', 'Abcdefghijklmnopqrstu');
      expect(auth).toStrictEqual(ERROR);
      expect(auth2).toStrictEqual(ERROR);
    });

    test('password < 8 char', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'f1', 'Ronaldo', 'Sui');
      expect(auth).toStrictEqual(ERROR);
    });

    test('passord does not have at least one number and one letter', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'IamEight', 'Ronaldo', 'Sui');
      const auth2 = adminAuthRegister('validemail@gmail.com', '12345678', 'Ronaldo', 'Sui');
      const auth3 = adminAuthRegister('validemail@gmail.com', '!!!!!!!!', 'Ronaldo', 'Sui');
      const auth4 = adminAuthRegister('validemail@gmail.com', '', 'Ronaldo', 'Sui');

      expect(auth).toStrictEqual(ERROR);
      expect(auth2).toStrictEqual(ERROR);
      expect(auth3).toStrictEqual(ERROR);
      expect(auth4).toStrictEqual(ERROR);
    });
  });

  describe('Functionality Testing', () => {
    test('Has the correct return type', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Ronaldo', 'Sui');
      expect(auth).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('successfully register 2 unique userIds', () => {
      const auth5 = adminAuthRegister('validemail5@gmail.com', 'password1!', 'Bobby', 'Bob');
      const auth6 = adminAuthRegister('validemail6@gmail.com', 'password1!', 'Bobby', 'Bob');
      expect(auth5).toStrictEqual({ authUserId: expect.any(Number) });
      expect(auth5).not.toStrictEqual(auth6);
    });

    test('successfully update numSuccessfulLogins', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
      if ('error' in auth) {
        expect(auth).toStrictEqual(ERROR);
      } else {
        const details = adminUserDetails(auth.authUserId);
        if ('error' in details) {
          expect(details).toStrictEqual(ERROR);
        } else {
          expect(details.user.numSuccessfulLogins).toStrictEqual(1);
        }
      }
    });

    test('successfully create numFailedPasswordsSinceLastLogin', () => {
      const auth = adminAuthRegister('validemail@gmail.com', 'password1!', 'Bobby', 'Bob');
      if ('error' in auth) {
        expect(auth).toStrictEqual(ERROR);
      } else {
        const details = adminUserDetails(auth.authUserId);
        if ('error' in details) {
          expect(details).toStrictEqual(ERROR);
        } else {
          expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
        }
      }
    });
  });
});
