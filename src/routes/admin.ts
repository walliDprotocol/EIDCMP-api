import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import validator from 'src/core-services/parameterValidator';

import * as AdminServices from 'src/services/admin';
import * as InviteServices from 'src/services/invites';

import { importExcelData } from 'src/services/utils';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:admin');

const REVOKE_PARAMETERS = ['id', 'waAdmin', 'tid'] as const;
const IMPORT_FILE = ['cid', 'tid', 'waAdmin', 'import_data'] as const;
const ACCEPT_PARAMETERS = ['invite_id', 'wa'] as const;
const PROFILE_PARAMETERS = ['wa'] as const;

// -> Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const dir = path.join(__dirname, '/uploads/');

    // create folder if there isnt exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    cb(null, dir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post('/revoke', async (request: Request, response: Response) => {
  logDebug('  **** REVOKE USER CREDENTIALS ROUTE *****  ');

  try {
    const {
      id, waAdmin, tid,
    } = validator(request.body, REVOKE_PARAMETERS);
    const result = await AdminServices.revokeUser({
      waAdmin, id, tid,
    });
    response.status(200).json(result);
  } catch (error: any) {
    logError('router:create template ', error);

    response.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

//  Parse import File
router.post('/parsefile', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { tid } = validator(req.body, ['tid']);
    const dir = path.join(__dirname, '/uploads/');

    if (!dir) {
      throw new Error('Should supply CSV file!');
    }

    logDebug('tid  ', tid);
    logDebug('body  ', req.body);
    // create folder if there isnt exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const filePath = path.join(dir, req.file?.filename || '');

    const result = await importExcelData(filePath, tid);
    res.json(result);
  } catch (error: any) {
    logError('router:parsefile ', error);
    res.status(500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

// Import file after been parsed
router.post('/importfile', async (request: Request, response: Response) => {
  logDebug('  **** route import file *****  ');

  try {
    validator(request.body, IMPORT_FILE);

    await AdminServices.importMultiData(request.body);
    response.status(200).json({ data: 'Invites will be sent' });
  } catch (error: any) {
    logError('router:create template ', error);

    response.status(error.code || 500)
      .json({ data: null, message: error.message || 'Internal server error' });
  }
});

router.post('/accept', async (request: Request, response: Response) => {
  try {
    const { wa, invite_id: inviteId } = validator(request.body, ACCEPT_PARAMETERS);

    const resp = await AdminServices.acceptOnboardingInvite(inviteId, wa);
    response.status(200).json(resp);
  } catch (error: any) {
    logError('router:admin/accept ', error);
    response.status(500).json({ mgs: 'not able accept', code: (error.code || 500) });
  }
});

router.post('/profile', async (request: Request, response: Response) => {
  try {
    const { wa } = validator(request.body, PROFILE_PARAMETERS);
    const admin = await AdminServices.getAdminProfile(wa);
    response.status(200).json({ data: admin });
  } catch (error:any) {
    logError('router:admin/profile ', error);
    response.sendStatus(error.code || 500);
  }
});

router.post('/invite-demo', async (request: Request, response: Response) => {
  try {
    validator(request.body, ['name', 'email']);

    const invite = await AdminServices.createDemoInvite(request.body);
    response.status(200).json(invite);
  } catch (error:any) {
    logError('router:invite-demo ', error);
    response.sendStatus(error.code || 500);
  }
});

router.post('/updateBilling', async (request: Request, response: Response) => {
  try {
    validator(request.body, ['dca_address', 'billing']);

    const invite = await AdminServices.updateBilling(request.body.contractAddress, request.body.balances);
    response.status(200).json(invite);
  } catch (error:any) {
    logError('router:updateBilling ', error);
    response.sendStatus(error.code || 500);
  }
});

// Manage admins routes
router.post('/invite', async (request, response) => {
  try {
    const { from, to, name } = validator(request.body, ['from', 'to']);
    await InviteServices.createAdminInviteAndSend(from, to, name);
    response.status(200).json({ data: null, message: null });
  } catch (error) {
    logError('router:invite ', error);
    response.status(400).json({ data: null, message: error });
  }
});

router.get('/invite', async (request, response) => {
  try {
    const { sent, received, userEmail } = validator(request.query, ['sent', 'received']);
    const invites = {
      sent: [],
      received: [],
    };
    if (sent) { invites.sent = await InviteServices.getSentInvites(userEmail); }
    if (received) { invites.received = await InviteServices.getReceivedInvites(userEmail); }
    response.status(200).json({ data: invites, message: null });
  } catch (error) {
    response.status(400).json({ data: null, message: error });
  }
});

export default router;
