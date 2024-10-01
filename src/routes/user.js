const express = require('express');
const {
  getUserByInvite, getUserById,
  updateUser,
} = require('src/services/user');

const router = new express.Router();
const validator = require('src/core-services/parameterValidator');
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:user');

router.get('/', async (request, response) => {
  logDebug('  **** RT:GetUserByInvite *****  ', request.query);

  try {
    const inviteId = request.query.inviteId || null;
    let result = {};

    if (inviteId) {
      logDebug('invite id ', request.query.inviteId);
      result = await getUserByInvite(request.query);
    } else {
      logDebug('User  id ', request.query.userId);
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
