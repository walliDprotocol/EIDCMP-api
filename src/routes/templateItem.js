const express = require('express');

const router = new express.Router();
const { createTemplateList } = require('src/services/templateItem');
const validator = require('src/core-services/parameterValidator');
const { logError } = require('src/core-services/logFunctionFactory').getLogger('router:templateItem');

const PARAMETERS = ['cid', 'tid', 'wa', 'attrs'];

router.post('/', async (request, response) => {
  try {
    validator(request.body, PARAMETERS);
    const out = await createTemplateList(request.body);

    response.status(200).json({
      message: 'templates itens inserted',
      data: out,
    });
  } catch (error) {
    logError(' router:post template itens  ', error);
    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.get('/', async (request, response) => {
  response.status(200).json({
    title: 'get template item',
  });
});

module.exports = router;
