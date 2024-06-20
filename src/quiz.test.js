import { adminQuizCreate, adminQuizRemove, adminQuizInfo } from "./quiz";
import { adminAuthRegister } from "./auth";
import { clear } from "./other";

const ERROR = { error: expect.any(String) };

describe("adminQuizInfo", () => {
    let authUserId1, authUserId2, quizId1, quizId2, quizId3
    beforeEach(() => {
        clear();
        authUserId1 = adminAuthRegister("auth@one.com", "authone1", "auth", "one").authUserId;
        authUserId2 = adminAuthRegister("auth@two.com", "authtwo2", "auth", "two").authUserId;
        quizId1 = adminQuizCreate(authUserId1, "first", "desc").quizId;
        quizId2 = adminQuizCreate(authUserId1, "second", "desc").quizId;
        quizId3 = adminQuizCreate(authUserId2, "name", "desc").quizId;
    });

    test("AuthUserId is not a valid user", () => {
        expect(adminQuizInfo("", quizId1)).toStrictEqual(ERROR);
    });

    test("Quiz ID does not refer to a valid quiz", () => {
        expect(adminQuizInfo(authUserId1, "")).toStrictEqual(ERROR);
    });

    test("Quiz ID does not refer to a quiz that this user owns", () => {
        expect(adminQuizInfo(authUserId1, quizId3)).toStrictEqual(ERROR);
    });

    test("Successfully view one quiz", () => {
        expect(adminQuizInfo(authUserId1, quizId1)).toStrictEqual({
            quizId: expect.any(Number),
            name: "first",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "desc"
        });
    });

    test("Successfully view multiple quizzes", () => {
        expect(adminQuizInfo(authUserId1, quizId1)).toStrictEqual({
            quizId: expect.any(Number),
            name: "first",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "desc"
        });

        expect(adminQuizInfo(authUserId1, quizId2)).toStrictEqual({
            quizId: expect.any(Number),
            name: "second",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "desc"
        });

        expect(adminQuizInfo(authUserId2, quizId3)).toStrictEqual({
            quizId: expect.any(Number),
            name: "name",
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: "desc"
        });
    });
});

describe("adminQuizRemove", () => {
    let authUserId1, authUserId2, quizId1, quizId2, quizId3, quizId4
    beforeEach(() => {
        clear();
        authUserId1 = adminAuthRegister("auth@one.com", "authone1", "auth", "one").authUserId;
        authUserId2 = adminAuthRegister("auth@two.com", "authtwo2", "auth", "two").authUserId;
        quizId1 = adminQuizCreate(authUserId1, "first", "desc").quizId;
        quizId2 = adminQuizCreate(authUserId1, "second", "desc").quizId;
        quizId3 = adminQuizCreate(authUserId1, "third", "desc").quizId;
        quizId4 = adminQuizCreate(authUserId2, "name", "desc").quizId;
    });

    test("AuthUserId is not a valid user", () => {
        expect(adminQuizRemove("", quizId1)).toStrictEqual(ERROR);
    });

    test("Quiz ID does not refer to a valid quiz", () => {
        expect(adminQuizRemove(authUserId1, "")).toStrictEqual(ERROR);
    });

    test("Quiz ID does not refer to a quiz that this user owns", () => {
        expect(adminQuizRemove(authUserId1, quizId4)).toStrictEqual(ERROR);
    });

    test("Correct return type", () => {
        expect(adminQuizRemove(authUserId1, quizId1)).toStrictEqual({});
    });

    test("Successfully delete one quiz", () => {
        adminQuizRemove(authUserId1, quizId1);
        expect(adminQuizCreate(authUserId1, "first", "desc").quizId).toStrictEqual(expect.any(Number));
    });

    test("Successfully delete multiple quizzes", () => {
        adminQuizRemove(authUserId1, quizId1);
        expect(adminQuizCreate(authUserId1, "first", "desc").quizId).toStrictEqual(expect.any(Number));

        adminQuizRemove(authUserId1, quizId3);
        expect(adminQuizCreate(authUserId1, "third", "desc").quizId).toStrictEqual(expect.any(Number));
    });
});