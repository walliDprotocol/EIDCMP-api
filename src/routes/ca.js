const { DB } = require('src/database');
const { DataBaseSchemas } = require('src/types/enums');

const express = require('express');
const { createCA, updateCA } = require('src/services/ca');
const validator = require('src/core-services/parameterValidator');
const { logError } = require('src/core-services/logFunctionFactory').getLogger('router:ca');

const router = new express.Router();
const UPDATE_CA_PARAMETERS = ['name', 'imgUrl', 'cid'];
const CREATE_CA_PARAMETERS = ['wa', 'admin_email'];
const GET_CA_PARAMETERS = ['waAdmin', 'cid'];

router.post('/', async (request, response) => {
  try {
    const { wa, admin_email: adminEmail } = validator(request.body, CREATE_CA_PARAMETERS);
    const out = await createCA({ admin_email: adminEmail, creatorWA: wa, admin: [wa] });

    response.status(200).json({
      message: out,
    });
  } catch (error) {
    logError(' router:create CA ', error);

    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.post('/updateca', async (request, response) => {
  try {
    const { name, cid, imgUrl } = validator(request.body, UPDATE_CA_PARAMETERS);
    const out = await updateCA({ name, cid, imgUrl });

    response.status(200).json({
      ...out,
    });
  } catch (error) {
    logError(' router:update CA ', error);

    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.post('/getca', async (request, response) => {
  try {
    const { cid } = validator(request.body, GET_CA_PARAMETERS);
    const ca = await DB.findOne(DataBaseSchemas.CA, { _id: cid }, '', {});

    response.status(200).json({
      data: ca,
    });
  } catch (error) {
    logError(' router: get CA', error);
    response.status(404).json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.get('/', async (request, response) => {
  response.status(200).json({
    title: 'get CA',
  });
});

module.exports = router;
