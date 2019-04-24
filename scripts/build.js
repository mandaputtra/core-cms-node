const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const babel = require('babel-core');
const chokidar = require('chokidar');
const task = require('./task');

module.exports = task('build', ({ watch = false, onComplete } = {}) => new Promise((resolve) => {
  let ready = false;

  rimraf.sync('build/*', { nosort: true, dot: true });

  let watcher = chokidar.watch(['src', 'public', 'package.json', 'yarn.lock']);
  watcher.on('all', (event, src) => {
    if (src === 'package.json' || src === 'yarn.lock') {
      if (ready && onComplete) onComplete();
      return;
    }

    if (path.basename(src)[0] === '.') return;

    const dest = src.startsWith('src') ? `build/${path.relative('src', src)}` : `build/${src}`;

    try {
      switch (event) {
        case 'addDir':
          if (!fs.existsSync(dest)) fs.mkdirSync(dest);
          if (ready && onComplete) onComplete();
          break;

        case 'add':
        case 'change':
          if (src.startsWith('src') && src.endsWith('.js')) {
            const { code, map } = babel.transformFileSync(src, {
              sourceMaps: true,
              sourceFileName: path.relative('./build', src),
            });

            const data = (src === 'src/server.js' ?
              'require(\'source-map-support\').install(); ' : '') + code +
              (map ? `\n//# sourceMappingURL=${path.basename(src)}.map\n` : '');
            fs.writeFileSync(dest, data, 'utf8');
            console.log(src, '->', dest);
            if (map) fs.writeFileSync(`${dest}.map`, JSON.stringify(map), 'utf8');
          } else if (src.startsWith('src')) {
            const data = fs.readFileSync(src, 'utf8');
            fs.writeFileSync(dest, data, 'utf8');
            console.log(src, '->', dest);
          }
          if (ready && onComplete) onComplete();
          break;

        case 'unlinkDir':
          if (fs.existsSync(dest)) fs.rmdirSync(dest);
          break;

        default:
      }
    } catch (err) {
      console.log(err.message);
    }
  });

  watcher.on('ready', () => {
    ready = true;
    if (onComplete) onComplete();
    if (!watch) watcher.close();
    resolve();
  });

  function cleanup() {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}));
