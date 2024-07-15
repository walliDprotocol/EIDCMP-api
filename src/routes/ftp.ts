import { Router } from 'express';
import multer from 'multer';
import mongoose, { mongo } from 'mongoose';

import { uploadFile } from 'src/services/ftp';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:ftp');

const { ObjectId, GridFSBucket } = mongo;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fields: 1, fileSize: 8000000, files: 1, parts: 2,
  },
});

const router = Router();

router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  logDebug('filename', fileId);
  try {
    const fileIdObjectId = new ObjectId(fileId);
    logDebug('fileIdObjectId', fileIdObjectId);
    const { db } = mongoose.connection;
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads',
    });

    const downloadStream = bucket.openDownloadStream(fileIdObjectId);

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', () => {
      logError('Error downloading file');
      res.sendStatus(404);
    });

    downloadStream.on('end', () => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({
      fileId,
      error,
    });
  }
});

router.post('/:filename', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Upload Request Validation Failed', err });
    } if (!req.params.filename) {
      return res.status(400).json({ message: 'No photo name in request body', err });
    }

    const { filename } = req.params;
    logDebug('filename', filename);

    const uploadResponse = await uploadFile(filename, req.file);

    return res.status(200).json(uploadResponse);
  });
});

export default router;
