const { exec } = require('child_process');

const runCommand = (...cmd) => {
  const builtCmd = `blockstack ${cmd.join(' ')}`;

  return new Promise((resolve, reject) => {
    exec(builtCmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }

      try {
        const msg = JSON.parse(stdout.trim());
        resolve({ json: msg });
      } catch (e) {
        resolve({ txt: stdout.trim() });
      }
    });
  });
};

module.exports = runCommand;
