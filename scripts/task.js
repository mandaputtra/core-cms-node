function run(task, action, ...args) {
  const command = process.argv[2];
  const taskName = command && !command.startsWith('-') ? `${task}:${command}` : task;
  const start = new Date();

  // eslint-disable-next-line
  console.log(`Starting '${taskName}'...`);

  return Promise.resolve().then(() => action(...args)).then(() => {
    // eslint-disable-next-line
    console.log(`Finished '${taskName}' after ${new Date().getTime() - start.getTime()}ms`);
  }, err => process.stderr.write(`${err.stack}\n`));
}

process.nextTick(() => require.main.exports());
module.exports = (task, action) => run.bind(undefined, task, action);
