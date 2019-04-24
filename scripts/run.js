const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const task = require('./task');

let build;
let server;

function spawnServerProcess() {
  const args = (process.env.NODE_DEBUG in ['true', 'on', 'yes', '1']) ? ['--inspect', '--no-lazy'] : [];
  server = cp.spawn('node', [...args, 'server.js'], { cwd: './build', stdio: 'inherit' });
}

process.once('cleanup', () => {
  if (server) {
    server.removeListener('exit', spawnServerProcess);
    server.addListener('exit', () => {
      server = null;
      process.exit();
    });
    server.kill('SIGTERM');
  } else {
    process.exit();
  }
});
process.on('SIGINT', () => process.emit('cleanup'));
process.on('SIGTERM', () => process.emit('cleanup'));

try {
  build = require('./build');
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') throw err;
  cp.spawnSync('yarn', ['install', '--no-progress'], { stdio: 'inherit' });

  try {
    const Module = require('module');
    const m = new Module();
    // eslint-disable-next-line
    m._compile(fs.readFileSync('./scripts/build.js', 'utf8'), path.resolve('./scripts/build.js'));
  } catch (error) { } // eslint-disable-line

  build = require('./build');
}

module.exports = task('run', () => Promise.resolve()
  .then(() => build({
    watch: true,
    onComplete() {
      if (server) {
        server.removeListener('exit', spawnServerProcess);
        server.addListener('exit', spawnServerProcess);
        server.kill();
      } else {
        spawnServerProcess();
      }
    },
  }))
  .then(() => new Promise((resolve) => {
    process.once('exit', () => {
      if (server) server.kill();
      resolve();
    });
  })));
