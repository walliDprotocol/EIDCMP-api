import { Readable } from 'stream';
import mongoose, { mongo } from 'mongoose';
import config from 'src/config';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:upload');

const { GridFSBucket } = mongo;

const { DOMAIN_ENV } = config;

export async function uploadFile(filename: string, file?: Express.Multer.File | { buffer: Buffer }) : Promise<{ message: string; id: string; url: string; }> {
  return new Promise((resolve, reject) => {
    logDebug('filename', filename);

    // Covert buffer to Readable Stream
    const readablePhotoStream = new Readable();
    readablePhotoStream.push(file?.buffer);
    readablePhotoStream.push(null);

    const { db } = mongoose.connection;
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads',
    });

    const uploadStream = bucket.openUploadStream(filename);
    const { id } = uploadStream;
    readablePhotoStream.pipe(uploadStream);

    uploadStream.on('error', () => {
      logError('Error uploading file');
      reject(new Error('Error uploading file'));
    });

    uploadStream.on('finish', () => {
      logDebug('File uploaded successfully');
      resolve({
        message: `File uploaded successfully, stored under Mongo ObjectID: ${id}`,
        id: id.toString(),
        url: `${DOMAIN_ENV}/ftp/${id}`,
      });
    });
  });
}
