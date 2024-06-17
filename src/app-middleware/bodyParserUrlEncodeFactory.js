const bodyParser = require('body-parser');

module.exports = function bodyParserUrlEncodeFactory() {
  return bodyParser.urlencoded({ limit: '50mb', extended: false });
};
