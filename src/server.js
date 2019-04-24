import path from 'path';
import chalk from 'chalk';
import commonConfig from '../common/config';
import config from '../config';
import app from './app';


const configDir = path.join(path.dirname(__dirname), 'config');
commonConfig.resolveLocalConfig(configDir, (err, file) => {
  if (err) console.log(chalk.red(err.message)); // eslint-disable-line no-console
  if (!err) console.log(chalk.green(`Loading config file: ${file}`)); // eslint-disable-line no-console
});

// eslint-disable-next-line no-console
console.log(chalk.green(`Running on ${chalk.underline(config.env.toUpperCase())} environment`));

// eslint-disable-next-line no-console
console.log(chalk.yellow('Creating server instance...'));

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(chalk.bgBlue(`Server started on port ${config.port}`));

  // eslint-disable-next-line no-console
  console.log(chalk.bgBlue(`PID is ${process.pid}`));
});
