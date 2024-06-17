const { Router } = require('express');
const routes = require('src/routes');
const ftp = require('src/routes/ftp').default;
const path = require('path');

const router = Router();
router.use('/api/v1', routes);
router.use('/ftp', ftp);
// legacy route for ftp
router.use('/files/uploaded/qr-codes', ftp);

router.use('*', async (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});
module.exports = function routesFactory() {
  return router;
};
