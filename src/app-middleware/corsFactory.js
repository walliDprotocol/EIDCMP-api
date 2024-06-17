const cors = require('cors');

function parseValues(originalValues) {
  let parsedValues = originalValues;
  if (originalValues.includes(',')) {
    parsedValues = originalValues.split(',');
  }
  return parsedValues;
}

module.exports = function corsFactory(config) {
  let corsOpts = {};
  if (config.enableCORS) {
    let origin = parseValues(config.allowedOrigins);
    origin = origin === 'true' ? JSON.parse(origin) : origin;
    const allowedHeaders = parseValues(config.allowedHeaders);
    corsOpts = {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      // preflightContinue: true,
      allowedHeaders,
      credentials: true,
      origin,
    };
  }
  return cors(corsOpts);
};
