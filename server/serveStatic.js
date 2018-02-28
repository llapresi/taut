const fs = require('fs');

const staticFiles = [
  {
    path: '/', file: 'index.html', code: 200, mimeType: 'text/html',
  },
  {
    path: '/bundle.js', file: 'bundle.js', code: 200, mimeType: 'application/javascript',
  },
  {
    path: '/style.css', file: 'style.css', code: 200, mimeType: 'text/css',
  },
];

const getFile = (res, file, mimeType, code) => {
  fs.readFile(`${__dirname}/../static/${file}`, (err, data) => {
    res.writeHead(code, { 'Content-Type': `${mimeType}` });
    res.write(data);
    res.end();
  });
};

const getIndex = (req, res) => {
  getFile(res, '/index.html', 'text/html', 200);
};

const getStaticFile = (req, res) => {
  for (let i = 0; i < staticFiles.length; i++) {
    if (staticFiles[i].path === req.url) {
      getFile(res, staticFiles[i].file, staticFiles[i].mimeType, staticFiles[i].code);
      return true;
    }
  }
  return false;
};

const getStaticHead = (req, res) => {
  for (let i = 0; i < staticFiles.length; i++) {
    if (staticFiles[i].path === req.url) {
      res.writeHead(200, { 'Content-Type': staticFiles[i].mimeType });
      res.end();
      return true;
    }
  }
  return false;
};

module.exports.getIndex = getIndex;
module.exports.getStaticFile = getStaticFile;
module.exports.getStaticHead = getStaticHead;
