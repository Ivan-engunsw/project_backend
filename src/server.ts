import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { clear } from './other';
import { adminAuthRegister, adminUserDetails, adminUserDetailsUpdate } from './auth';
import { adminQuizCreate, adminQuizInfo, adminQuizRemove, adminQuizTransfer, adminQuizViewTrash, adminQuizDescriptionUpdate, adminQuizNameUpdate, adminQuizList } from './quiz';
import { generateToken, validToken, removeToken } from './helper';
import { ErrorObject } from './errors';

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
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

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

// Given an ErrorObject/cause of error, set the response for the server
const setError = (error: ErrorObject, res: Response) =>
  res.status(error.errorCode).json({ error: error.errorMsg });

app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  res.json(result);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('errorMsg' in result) {
    return setError(result, res);
  }

  const token = generateToken(result.authUserId);
  res.json(token);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token.toString();
  const user = validToken(token);
  if ('errorMsg' in user) {
    return setError(user, res);
  }

  const result = adminUserDetails(user.authUserId);
  if ('errorMsg' in result) {
    return setError(result, res);
  }
  res.json(result);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const authUser = validToken(token);
  if ('errorMsg' in authUser) {
    return setError(authUser, res);
  }
  const result = adminUserDetailsUpdate(authUser.authUserId, email, nameFirst, nameLast);
  if ('errorMsg' in result) {
    return setError(result as ErrorObject, res);
  }
  res.json(result);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = removeToken(token);
  if ('errorMsg' in result) {
    return setError(result as ErrorObject, res);
  }

  res.json(result);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const authUser = validToken(token);
  if ('errorMsg' in authUser) {
    return setError(authUser, res);
  }
  const result = adminQuizCreate(authUser.authUserId, name, description);
  if ('errorMsg' in result) {
    return setError(result, res);
  }
  res.json(result);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const authUser = validToken(req.query.token as string);
  if ('errorMsg' in authUser) return setError(authUser, res);

  res.json(adminQuizViewTrash(authUser.authUserId));
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const authUser = validToken(req.query.token as string);
  if ('errorMsg' in authUser) {
    return setError(authUser, res);
  }
  const result = adminQuizList(authUser.authUserId);
  res.json(result);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const authUser = validToken(req.query.token as string);
  if ('errorMsg' in authUser) return setError(authUser, res);

  const result = adminQuizRemove(authUser.authUserId, parseInt(req.params.quizid as string));
  return ('errorMsg' in result) ? setError(result as ErrorObject, res) : res.json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const authUser = validToken(req.query.token as string);
  if ('errorMsg' in authUser) return setError(authUser, res);

  const result = adminQuizInfo(authUser.authUserId, parseInt(req.params.quizid as string));
  return ('errorMsg' in result) ? setError(result, res) : res.json(result);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid.toString());
  const { token, userEmail } = req.body;

  const user = validToken(token);
  if ('errorMsg' in user) {
    return setError(user, res);
  }

  const result = adminQuizTransfer(user.authUserId, quizId, userEmail);
  if ('errorMsg' in result) {
    return setError(result as ErrorObject, res);
  }
  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizid.toString());

  const user = validToken(token);
  if ('errorMsg' in user) {
    return setError(user, res);
  }

  const result = adminQuizDescriptionUpdate(user.authUserId, quizId, description);
  if ('errorMsg' in result) {
    return setError(result as ErrorObject, res);
  }
  res.json(result);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizid.toString());

  const user = validToken(token);
  if ('errorMsg' in user) {
    return setError(user, res);
  }

  const result = adminQuizNameUpdate(user.authUserId, quizId, name);
  if ('errorMsg' in result) {
    return setError(result as ErrorObject, res);
  }
  res.json(result);
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
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
