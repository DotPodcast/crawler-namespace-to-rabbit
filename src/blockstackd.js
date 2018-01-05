const nconf = require('nconf');
const { exec } = require('child_process');

// Pull configuration
nconf.argv()
  .env()
  .file('config.json');

const CORE_PATH = nconf.get('blockstack:corePath');

// This means you need to have the blockstackd-cli (go cli built by Jack)
// available on your path.
const runCommand = (...cmd) => {
  const builtCmd = `blockstackd-cli -n ${CORE_PATH} ${cmd.join(' ')}`;

  return new Promise((resolve, reject) => {
    exec(builtCmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        console.log(e);
        resolve({ error: 'Failed to run command. Check the logs for more detail.' });
      }
    });
  });
};

const getNumNamesInNamespace = ns => runCommand('get_num_names_in_namespace', ns);

const getNamesInNamespace = (ns, offset, count) => runCommand('get_names_in_namespace', ns, offset, count);

module.exports = {
  getNumNamesInNamespace,
  getNamesInNamespace,
};
