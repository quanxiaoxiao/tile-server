const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const url = require('url');
const config = require('./config');

const now = Date.now();

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.setHeader(405);
    req.end();
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  const { pathname } = url.parse(req.url);
  if (!pathname.match(/\/tile\/(\d+)\/(\d+)\/(\d+)$/)) {
    res.writeHead(404);
    res.end();
  } else {
    const routeList = [RegExp.$1, RegExp.$2, RegExp.$3];
    const tilePathname = path.join(config.tilePath, ...routeList);
    const match = req.headers['if-none-match'];
    const hash = crypto.createHash('sha1').update(`${now}_${routeList.join('/')}`).digest('hex');
    if (match === hash) {
      res.writeHead(304);
      res.end();
    } else if (fs.existsSync(tilePathname)) {
      res.setHeader('etag', hash);
      fs
        .createReadStream(tilePathname)
        .pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  }
});

server.listen(config.port, () => {
  console.log(`server listen at: ${config.port}`);
});
