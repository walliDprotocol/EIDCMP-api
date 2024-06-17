const config = require('src/config').default;
const express = require('express');
const multer = require('multer');
const fs = require('fs');

const router = new express.Router();
const { log } = require('console');

// Configuração do Multer para armazenar arquivos na pasta public/uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    log('req:destination', req.params.folder);
    let folder = './uploads';
    if (req.params.folder) {
      folder = `./uploads/${req.params.folder}`;
    }
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename(req, file, cb) {
    log('req:filename', req.params.folder);

    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/file/:folder', upload.single('file'), (req, res) => {
  let folder = '/';
  if (req.params && req.params.folder) {
    folder = `${req.params.folder}/`;
  }
  res.send({ msg: 'Arquivo enviado com sucesso!', url: `${config.domain_env}/files/uploaded/${folder}${req.file.filename}` });
});

module.exports = router;
