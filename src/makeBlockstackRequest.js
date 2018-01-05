const winston = require('winston');
const { exec } = require('child_process');

const runCommand = (...cmd) => {
  const builtCmd = `blockstack ${cmd.join(' ')}`;

  return new Promise((resolve) => {
    exec(builtCmd, (err, stdout) => {
      if (err) {
        winston.log('error', `exec error: ${err}`);
        return;
      }

      try {
        const msg = JSON.parse(stdout.trim());
        resolve({ json: msg });
      } catch (e) {
        // TODO use reject instead and catch rejections up the promise chain
        resolve({ txt: stdout.trim() });
      }
    });
  });
};

module.exports = runCommand;
