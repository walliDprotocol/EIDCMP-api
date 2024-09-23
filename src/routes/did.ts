import { Router } from 'express';
import mongoose, { mongo } from 'mongoose';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:did');

const router = Router();

router.post('create', async (req, res) => {
  logDebug('create', req.body);
  res.status(200).json(req.body);
});

router.put('update', async (req, res) => {
  logDebug('update', req.body);
  res.status(200).json(req.body);
});

router.delete('deactivate', async (req, res) => {
  logDebug('deactivate', req.body);
  res.status(200).json(req.body);
});

router.post('reactivate', async (req, res) => {
  logDebug('activate', req.body);
  res.status(200).json(req.body);
});

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  logDebug('filename', fileId);
});

export default router;
