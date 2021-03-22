const path = require('path');

module.exports = {
  port: 4000,
  tilePath: path.resolve(__dirname, '..', 'tiles'),
  tilePurePathname: path.resolve(__dirname, '..', 'tiles', 'pure'),
};
