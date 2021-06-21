const path = require('path');

module.exports = {
  port: 3000,
  tilePath: path.resolve(__dirname, '..', 'tiles'),
  // tilePath: path.resolve(os.homedir(), 'run', 'tile-server', 'tiles'),
};
