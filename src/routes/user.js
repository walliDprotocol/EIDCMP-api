const express = require('express');
const {
  inviteNewUser, getUserByInvite, getUserById,
  updateUser,
} = require('src/services/user');

const router = new express.Router();
const validator = require('src/core-services/parameterValidator');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:user');

const PARAMETERS = ['cid', 'tid', 'wa_admin', 'email', 'data'];

/**
 * Create User
 */
router.post('/', async (request, response) => {
  logDebug('  **  create user data  **  ');

  try {
    const {
      cid, tid, wa_admin: waAdmin, data, email,
    } = validator(request.body, PARAMETERS);
    const result = await inviteNewUser({
      cid,
      tid,
      waAdmin,
      data,
      email,
      imgArray: request.body.imgArray
      ,
    });

    response.status(200).json(result);
  } catch (error) {
    logError('router:create template ', error);

    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.get('/', async (request, response) => {
  logDebug('  **** RT:GetUserByInvite *****  ', request.query);

  try {
    // const { inviteId, user_id  } = validator(request.query, GETUSER_PARAMS)
    const inviteId = request.query.inviteId || null;
    let result = {};

    if (inviteId) {
      logDebug('invite id ', request.query.inviteId);
      result = await getUserByInvite(request.query);
    } else {
      logDebug('User  id ', request.query.user_id);
      result = await getUserById(request.query);
    }

    response.status(200).json(result);
  } catch (error) {
    logError('routerError:getUserByInvite ', error);
    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.patch('/', async (request, response) => {
  logDebug('  **** RT:UpdateUser *****  ', request.body);

  try {
    const { userId, data } = validator(request.body, ['userId', 'data']);
    const result = await updateUser(userId, data);

    response.status(200).json(result);
  } catch (error) {
    logError('routerError:updateUser ', error);
    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

module.exports = router;
