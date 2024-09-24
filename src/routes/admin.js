const express = require('express');

const router = new express.Router();
const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:admin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const validator = require('src/core-services/parameterValidator');

const AdminServices = require('src/services/admin');

const { importExcelData } = require('src/services/utils');

const REVOKE_PARAMETERS = ['id', 'waAdmin', 'tid'];
const IMPORT_FILE = ['cid', 'tid', 'waAdmin', 'import_data'];
const ACCEPT_PARAMETERS = ['invite_id', 'wa'];
const PROFILE_PARAMETERS = ['wa'];

// -> Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/');

    // create folder if there isnt exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/revoke', async (request, response) => {
  logDebug('  **** REVOKE USER CREDENTIALS ROUTE *****  ');

  try {
    const {
      id, waAdmin, tid,
    } = validator(request.body, REVOKE_PARAMETERS);
    const result = await AdminServices.revokeUser({
      waAdmin, id, tid,
    });
    response.status(200).json(result);
  } catch (error) {
    logError('router:create template ', error);

    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

//  Parse import File
router.post('/parsefile', upload.single('file'), async (req, res) => {
  try {
    const { tid } = validator(req.body, ['tid']);
    const dir = path.join(__dirname, '../../uploads/');

    if (!dir) {
      throw new Error('Should supply CSV file!');
    }

    logDebug('tid  ', tid);
    logDebug('body  ', req.body);
    // create folder if there isnt exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const result = await importExcelData(dir + req.file.filename, tid);
    res.json({
      data: result,
    });
  } catch (ex) {
    logError('router:parsefile ', ex);
    res.status(500)
      .json({ data: null, message: ex.message || 'Internal server error' });
  }
});

// Import file after been parsed
router.post('/importfile', async (request, response) => {
  logDebug('  **** route import file *****  ');

  try {
    validator(request.body, IMPORT_FILE);

    await AdminServices.importMultiData(request.body);
    response.status(200).json({ data: 'Invites will be sent' });
  } catch (error) {
    logError('router:create template ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.post('/accept', async (request, response) => {
  try {
    const { wa, invite_id: inviteId } = validator(request.body, ACCEPT_PARAMETERS);

    const resp = await AdminServices.acceptOnboardingInvite(inviteId, wa);
    response.status(200).json(resp);
  } catch (error) {
    logError('router:admin/accept ', error);
    response.status(500).json({ mgs: 'not able accept', code: (error.code || 500) });
  }
});

router.post('/profile', async (request, response) => {
  try {
    const { wa } = validator(request.body, PROFILE_PARAMETERS);
    const admin = await AdminServices.getAdminProfile(wa);
    response.status(200).json({ data: admin });
  } catch (error) {
    logError('router:admin/profile ', error);
    response.sendStatus(error.code || 500);
  }
});

router.post('/invite-demo', async (request, response) => {
  try {
    validator(request.body, ['name', 'email']);

    const invite = await AdminServices.createDemoInvite(request.body);
    response.status(200).json(invite);
  } catch (error) {
    logError('router:invite-demo ', error);
    response.sendStatus(error.code || 500);
  }
});

router.post('/updateBilling', async (request, response) => {
  try {
    validator(request.body, ['dca_address', 'billing']);

    const invite = await AdminServices.updateBilling(request.body);
    response.status(200).json(invite);
  } catch (error) {
    logError('router:updateBilling ', error);
    response.sendStatus(error.code || 500);
  }
});

module.exports = router;
