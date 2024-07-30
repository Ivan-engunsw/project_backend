import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../config.json';

/* ========================================================================= */
// CONSTANTS //
/* ========================================================================= */
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

/* ========================================================================= */
// HELPER FUNCTIONS //
/* ========================================================================= */
export function requestHelper(method: HttpVerb, path: string, payload: { [key: string]: any }) {
  let qs = {};
  let json = {};
  const headers = { token: payload.token };
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  return request(method, path, { qs, json, headers, timeout: TIMEOUT_MS });
}

/* ========================================================================= */
// ITER 2 V1 HTTP REQUESTS //
// THESE FUNCTIONS DON'T NEED A TOKEN SO THEY DON'T NEED TO BE UPDATED TO V2 //
/* ========================================================================= */
export const clear = () => {
  request('DELETE', SERVER_URL + '/v1/clear', {
    timeout: TIMEOUT_MS
  });
};

export const adminAuthRegister = (
  payload: {
    email: string,
    password: string,
    nameFirst: string,
    nameLast: string,
  }
) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: payload,
    timeout: TIMEOUT_MS
  });
};

export const adminAuthLogin = (
  payload: {
    email: string,
    password: string,
  }
) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: payload,
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// UPDATED ITER 2 V2 HTTP REQUESTS //
// THESE FUNCTIONS NEED A TOKEN SO THEY NEED TO BE UPDATED TO V2 //
/* ========================================================================= */

/* ========================================================================= */
// ADMIN/AUTH REQUESTS //
/* ========================================================================= */
export const adminUserDetails = (
  payload: {
    token: string
  }
) => {
  return request('GET', SERVER_URL + '/v2/admin/user/details', {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminAuthLogout = (
  payload: {
    token: string
  }
) => {
  return request('POST', SERVER_URL + '/v2/admin/auth/logout', {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminUserDetailsUpdate = (
  payload: {
    token: string,
    email: string,
    nameFirst: string,
    nameLast: string,
  }
) => {
  return request('PUT', SERVER_URL + '/v2/admin/user/details', {
    headers: {
      token: payload.token
    },
    json: payload,
    timeout: TIMEOUT_MS
  });
};

export const adminUserPasswordUpdate = (
  payload: {
    token: string,
    oldPassword: string,
    newPassword: string,
  }
) => {
  return request('PUT', SERVER_URL + '/v2/admin/user/password', {
    headers: {
      token: payload.token
    },
    json: payload,
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// QUIZ REQUESTS //
/* ========================================================================= */
export const adminQuizList = (
  payload: {
    token: string,
  }
) => {
  return request('GET', SERVER_URL + '/v2/admin/quiz/list', {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizCreate = (
  payload: {
    token: string,
    name: string,
    description: string,
  }
) => {
  return request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: {
      token: payload.token
    },
    json: payload,
    timeout: TIMEOUT_MS
  });
};

export const adminQuizRemove = (
  payload: {
    token: string,
    quizid: number,
  }
) => {
  return request('DELETE', SERVER_URL + `/v2/admin/quiz/${payload.quizid}`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizInfo = (
  payload: {
    token: string,
    quizid: number,
  }
) => {
  return request('GET', SERVER_URL + `/v2/admin/quiz/${payload.quizid}`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizNameUpdate = (
  payload: {
    token: string,
    quizid: number,
    name: string,
  }
) => {
  return request('PUT', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/name`, {
    headers: {
      token: payload.token
    },
    json: {
      name: payload.name
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizDescriptionUpdate = (
  payload: {
    token: string,
    quizid: number,
    description: string,
  }
) => {
  return request('PUT', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/description`, {
    headers: {
      token: payload.token
    },
    json: {
      description: payload.description
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizTrashView = (
  payload: {
    token: string,
  }
) => {
  return request('GET', SERVER_URL + '/v2/admin/quiz/trash', {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizRestore = (
  payload: {
    token: string,
    quizid: number,
  }
) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/restore`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizTrashEmpty = (
  payload: {
    token: string,
    quizIds: number[],
  }
) => {
  return request('DELETE', SERVER_URL + '/v2/admin/quiz/trash/empty', {
    headers: {
      token: payload.token
    },
    qs: {
      quizIds: JSON.stringify(payload.quizIds)
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizTransfer = (
  payload: {
    token: string,
    quizid: number,
    userEmail: string,
  }
) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/transfer`, {
    headers: {
      token: payload.token
    },
    json: {
      userEmail: payload.userEmail
    },
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// QUIZ QUESTION REQUESTS //
/* ========================================================================= */
export const adminQuizQuestionCreate = (
  payload: {
    token: string,
    quizid: number,
    questionBody: {
      question: string,
      duration: number,
      points: number,
      answers: { answer: string, correct: boolean }[],
    },
  }
) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/question`, {
    headers: {
      token: payload.token
    },
    json: {
      questionBody: payload.questionBody
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizQuestionUpdate = (
  payload: {
    token: string,
    quizid: number,
    questionid: number,
    questionBody: {
      question: string,
      duration: number,
      points: number,
      answers: { answer: string, correct: boolean }[],
    },
  }
) => {
  return request('PUT', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/question/${payload.questionid}`, {
    headers: {
      token: payload.token
    },
    json: {
      questionBody: payload.questionBody
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizQuestionDelete = (
  payload: {
    token: string,
    quizid: number,
    questionid: number,
  }
) => {
  return request('DELETE', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/question/${payload.questionid}`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizQuestionMove = (
  payload: {
    token: string,
    quizid: number,
    questionid: number,
    newPosition: number,
  }
) => {
  return request('PUT', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/question/${payload.questionid}/move`, {
    headers: {
      token: payload.token
    },
    json: {
      newPosition: payload.newPosition
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizQuestionDuplicate = (
  payload: {
    token: string,
    quizid: number,
    questionid: number,
  }
) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${payload.quizid}/question/${payload.questionid}/duplicate`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// V1 ITER 3 ROUTES (NEW)
/* ========================================================================= */

/* ========================================================================= */
// QUIZ REQUESTS
/* ========================================================================= */
export const adminQuizThumbnailUpdate = (
  payload: {
    token: string,
    quizid: number,
    imgUrl: string,
  }
) => {
  return request('PUT', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/thumbnail`, {
    headers: {
      token: payload.token
    },
    json: {
      imgUrl: payload.imgUrl
    },
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// SESSION REQUESTS
/* ========================================================================= */
export const adminQuizSessionsList = (
  payload: {
    token: string,
    quizid: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/sessions`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizSessionStart = (
  payload: {
    token: string,
    quizid: number,
    autoStartNum: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/session/start`, {
    headers: {
      token: payload.token
    },
    json: {
      autoStartNum: payload.autoStartNum
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizSessionUpdate = (
  payload: {
    token: string,
    quizid: number,
    sessionid: number,
    action: string,
  }
) => {
  return request('PUT', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/session/${payload.sessionid}`, {
    headers: {
      token: payload.token
    },
    json: {
      action: payload.action
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizSessionStatus = (
  payload: {
    token: string,
    quizid: number,
    sessionid: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/session/${payload.sessionid}`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizSessionResult = (
  payload: {
    token: string,
    quizid: number,
    sessionid: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/session/${payload.sessionid}/results`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

export const adminQuizSessionResultCSV = (
  payload: {
    token: string,
    quizid: number,
    sessionid: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${payload.quizid}/session/${payload.sessionid}/results/csv`, {
    headers: {
      token: payload.token
    },
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// PLAYER REQUESTS
/* ========================================================================= */
export const playerSessionJoin = (
  payload: {
    sessionId: number,
    name: string,
  }
) => {
  return request('POST', SERVER_URL + '/v1/player/join', {
    json: {
      sessionId: payload.sessionId,
      name: payload.name,
    },
    timeout: TIMEOUT_MS
  });
};

export const playerSessionStatus = (
  payload: {
    playerid: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/player/${payload.playerid}`, {
    timeout: TIMEOUT_MS
  });
};

export const playerQuestionInfo = (
  payload: {
    playerid: number,
    questionposition: number,
  }
) => {
  return request('GET', SERVER_URL + `/v1/player/${payload.playerid}/question/${payload.questionposition}`, {
    timeout: TIMEOUT_MS
  });
};

export const playerQuestionAnswer = (
  payload: {
    playerid: number,
    questionposition: number,
    answerIds: number[],
  }
) => {
  return request('PUT', SERVER_URL + `v1/player/${payload.playerid}/question/${payload.questionposition}/answer`, {
    json: {
      answerIds: payload.answerIds
    },
    timeout: TIMEOUT_MS
  });
};

export const playerQuestionResult = (
  payload: {
    playerid: number,
    questionposition: number,
  }
) => {
  return request('GET', SERVER_URL + `v1/player/${payload.playerid}/question/${payload.questionposition}/results`, {
    timeout: TIMEOUT_MS
  });
};

export const playerResult = (
  payload: {
    playerid: number,
  }
) => {
  return request('GET', SERVER_URL + `v1/player/${payload.playerid}/results`, {
    timeout: TIMEOUT_MS
  });
};

/* ========================================================================= */
// CHAT REQUESTS
/* ========================================================================= */
export const playerChatView = (
  payload: {
    playerid: number,
  }
) => {
  return request('GET', SERVER_URL + `v1/player/${payload.playerid}/chat`, {
    timeout: TIMEOUT_MS
  });
};

export const playerChatSend = (
  payload: {
    playerid: number,
    message: { messageBody: string },
  }
) => {
  return request('POST', SERVER_URL + `v1/player/${payload.playerid}/chat`, {
    json: {
      message: payload.message
    },
    timeout: TIMEOUT_MS
  });
};
