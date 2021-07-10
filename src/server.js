const http = require('http');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const url = require('url');
const _ = require('lodash');
const shelljs = require('shelljs');
const FileType = require('file-type');
const { fetchData } = require('@quanxiaoxiao/about-http');
const config = require('./config');

const startOf = Date.now();

const tileProvider = (x, y, z) => `http://webrd${['01', '02', '03', '04'][_.random([0, 4])]}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=${x}&y=${y}&z=${z}`;

const server = http.createServer(async (req, res) => {
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
    const hash = crypto.createHash('sha1').update(`${startOf}_${routeList.join('/')}`).digest('hex');
    if (match === hash) {
      res.writeHead(304);
      res.end();
    } else if (fs.existsSync(tilePathname)) {
      res.setHeader('etag', hash);
      fs
        .createReadStream(tilePathname)
        .pipe(res);
    } else {
      const [z, x, y] = routeList;
      try {
        const buf = await fetchData({
          url: tileProvider(x, y, z),
          headers: {
            'User-Agent': `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/${Math.random() * 100}`,
          },
        });
        const fileType = await FileType.fromBuffer(buf);
        if (fileType && /^image\//.test(fileType.mime)) {
          const dirname = path.dirname(tilePathname);
          if (!shelljs.test('-d', dirname)) {
            shelljs.mkdir('-p', dirname);
          }
          fs.writeFileSync(tilePathname, buf);
          res.setHeader('etag', hash);
          res.end(buf);
        } else {
          res.writeHead(404);
          res.end();
        }
      } catch (error) {
        res.writeHead(404);
        res.end();
      }
    }
  }
});

server.listen(config.port, () => {
  console.log(`server listen at: ${config.port}`);
});
