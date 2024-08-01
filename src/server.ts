import express, {
  json,
  Request,
  Response
} from 'express';
import {
  echo
} from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import {
  clear,
  generateToken,
  validToken,
  removeToken
} from './other';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth';
import * as quiz from './quiz';
import * as session from './session';
import * as player from './player';
import { validQuiz } from './helper';
import { setData } from './dataStore';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), {
  swaggerOptions: {
    docExpansion: config.expandDocs ? 'full' : 'list'
  }
}));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

// Given an error, set the response for the server
const setError = (res: Response, error: Error, flag: 'p' | 't' | 'q') => {
  switch (flag) {
    case 'p': res.status(400); break;
    case 't': res.status(401); break;
    case 'q': res.status(403); break;
  }
  res.json({ error: error.message });
  return res;
};

// ====================================================================
//  ========================= ITER 2 ROUTES ==========================
// ====================================================================

// OTHER REQUESTS //
// Clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  res.json(result);
});

// AUTH REQUESTS //
// Auth register
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const {
    email,
    password,
    nameFirst,
    nameLast
  } = req.body;
  try {
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    const token = generateToken(result.authUserId);
    res.json(token);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Auth login
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const {
    email,
    password
  } = req.body;
  try {
    const result = adminAuthLogin(email, password);
    const token = generateToken(result.authUserId);
    res.json(token);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// User details
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token.toString();
  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  const result = adminUserDetails(user.authUserId);
  res.json(result);
});

// User details update
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const {
    token,
    email,
    nameFirst,
    nameLast
  } = req.body;
  let authUser;
  try {
    authUser = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    const result = adminUserDetailsUpdate(authUser.authUserId, email, nameFirst, nameLast);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// User password update
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const {
    token,
    oldPassword,
    newPassword
  } = req.body;
  let authUser;
  try {
    authUser = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    const result = adminUserPasswordUpdate(authUser.authUserId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Auth logout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token;
  try {
    const result = removeToken(token);
    res.json(result);
  } catch (error) {
    return setError(res, error, 't');
  }
});

// QUIZ REQUESTS //
// Quiz create
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const {
    token,
    name,
    description
  } = req.body;
  let authUser;
  try {
    authUser = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    const result = quiz.adminQuizCreate(authUser.authUserId, name, description);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz trash view
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.query.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  res.json(quiz.adminQuizTrashView(authUser.authUserId));
});

// Quiz list
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.query.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  const result = quiz.adminQuizList(authUser.authUserId);
  res.json(result);
});

// Quiz remove
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.query.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(parseInt(req.params.quizid as string), authUser.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizRemove(parseInt(req.params.quizid as string));
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz info
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.query.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(parseInt(req.params.quizid as string), authUser.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  const result = quiz.adminQuizInfo(parseInt(req.params.quizid as string));
  const { thumbnailUrl, ...filtered } = result;
  res.json(filtered);
});

// Quiz restore
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const {
    token
  } = req.body;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId, { trash: true });
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizRestore(quizId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz transfer
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const {
    token,
    userEmail
  } = req.body;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizTransfer(user.authUserId, quizId, userEmail);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz description update
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const {
    token,
    description
  } = req.body;
  const quizId = parseInt(req.params.quizid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizDescriptionUpdate(quizId, description);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz name update
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const {
    token,
    name
  } = req.body;
  const quizId = parseInt(req.params.quizid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizNameUpdate(user.authUserId, quizId, name);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz trash empty
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token.toString();
  const quizIds = JSON.parse(req.query.quizIds.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  for (const quizId of quizIds) {
    try {
      validQuiz(quizId, user.authUserId, { trash: true });
    } catch (error) {
      return setError(res, error, 'q');
    }
  }

  try {
    const result = quiz.adminQuizTrashEmpty(quizIds);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// QUESTION REQUESTS //
// Question create
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const {
    token,
    questionBody
  } = req.body;
  const quizId = parseInt(req.params.quizid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionCreate(quizId, questionBody);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question update
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const {
    token,
    questionBody
  } = req.body;
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionUpdate(quizId, questionId, questionBody);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question delete
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());

  const token = req.query.token.toString();
  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionDelete(quizId, questionId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question move
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());

  const {
    token,
    newPosition
  } = req.body;
  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionMove(quizId, questionId, newPosition);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question duplicate
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());

  const {
    token
  } = req.body;
  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionDuplicate(quizId, questionId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// ====================================================================
//  ========================= ITER 3 ROUTES ==========================
// ====================================================================

// AUTH REQUESTS //
// User details
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token.toString();

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  const result = adminUserDetails(user.authUserId);

  res.json(result);
});

// User details update
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const {
    email,
    nameFirst,
    nameLast
  } = req.body;
  let authUser;
  try {
    authUser = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    const result = adminUserDetailsUpdate(authUser.authUserId, email, nameFirst, nameLast);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// User password update
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const {
    oldPassword,
    newPassword
  } = req.body;
  let authUser;
  try {
    authUser = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    const result = adminUserPasswordUpdate(authUser.authUserId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Auth logout
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token.toString();

  try {
    const result = removeToken(token);
    res.json(result);
  } catch (error) {
    return setError(res, error, 't');
  }
});

// QUIZ REQUESTS //
// Quiz create
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const {
    name,
    description
  } = req.body;

  let authUser;
  try {
    authUser = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    const result = quiz.adminQuizCreate(authUser.authUserId, name, description);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz list
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.headers.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  const result = quiz.adminQuizList(authUser.authUserId);
  res.json(result);
});

// Quiz trash view
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.headers.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  res.json(quiz.adminQuizTrashView(authUser.authUserId));
});

// Quiz info
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  let user;
  try {
    user = validToken(req.headers.token as string);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(parseInt(req.params.quizid as string), user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  const result = quiz.adminQuizInfo(parseInt(req.params.quizid as string));
  res.json(result);
});

// Quiz remove
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  let authUser;
  try {
    authUser = validToken(req.headers.token.toString());
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(parseInt(req.params.quizid as string), authUser.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizRemove(parseInt(req.params.quizid as string));
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz name update
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const name = req.body.name;
  const quizId = parseInt(req.params.quizid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizNameUpdate(user.authUserId, quizId, name);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz description update
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const description = req.body.description;
  const quizId = parseInt(req.params.quizid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizDescriptionUpdate(quizId, description);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz restore
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const token = req.headers.token.toString();

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId, { trash: true });
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizRestore(quizId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz transfer
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const token = req.headers.token.toString();
  const userEmail = req.body.userEmail;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizTransfer(user.authUserId, quizId, userEmail);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz trash empty
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const quizIds = JSON.parse(req.query.quizIds.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  for (const quizId of quizIds) {
    try {
      validQuiz(quizId, user.authUserId, { trash: true });
    } catch (error) {
      return setError(res, error, 'q');
    }
  }

  try {
    const result = quiz.adminQuizTrashEmpty(quizIds);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Quiz thumbnail update
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const quizId = parseInt(req.params.quizid.toString());
  const imgUrl = req.body.imgUrl;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizThumbnailUpdate(quizId, imgUrl);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// QUESTION REQUESTS //
// Question create
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const questionBody = req.body.questionBody;
  const quizId = parseInt(req.params.quizid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionCreate(quizId, questionBody);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question update
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.headers.token.toString();
  const questionBody = req.body.questionBody;
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionUpdate(quizId, questionId, questionBody);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question move
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());
  const newPosition = req.body.newPosition;
  const token = req.headers.token as string;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionMove(quizId, questionId, newPosition);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question delete
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());
  const token = req.headers.token.toString();

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionDelete(quizId, questionId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Question duplicate
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const questionId = parseInt(req.params.questionid.toString());
  const token = req.headers.token as string;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = quiz.adminQuizQuestionDuplicate(quizId, questionId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// SESSION REQUESTS //
// Session start
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const token = req.headers.token.toString();
  const autoStartNum = req.body.autoStartNum;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId, { trash: true });
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = session.adminQuizSessionStart(quizId, autoStartNum);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Session update
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.params.sessionid as string);
  const token = req.headers.token as string;
  const action = req.body.action;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = session.adminQuizSessionUpdate(quizId, sessionId, action);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// Session status
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid as string);
  const sessionId = parseInt(req.params.sessionid as string);
  const token = req.headers.token as string;

  let user;
  try {
    user = validToken(token);
  } catch (error) {
    return setError(res, error, 't');
  }

  try {
    validQuiz(quizId, user.authUserId);
  } catch (error) {
    return setError(res, error, 'q');
  }

  try {
    const result = session.adminQuizSessionStatus(quizId, sessionId);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// PLAYER REQUESTS //
// Player join
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;

  try {
    const result = player.playerSessionJoin(sessionId, name);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerid = parseInt(req.params.playerid.toString());
  const questionposition = parseInt(req.params.playerid.toString());
  const answerIds = req.body.answerIds;

  try {
    const result = player.playerQuestionAnswer(playerid, questionposition, answerIds);
    res.json(result);
  } catch (error) {
    return setError(res, error, 'p');
  }
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({
    error
  });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
  if (fs.existsSync('src/dataStoreSave.json')) {
    const data = JSON.parse(fs.readFileSync('src/dataStoreSave.json', {
      flag: 'r'
    }).toString());
    setData(data);
  }
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
