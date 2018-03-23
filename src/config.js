import nconf from 'nconf';

// Pull in configuration
nconf.argv()
  .env({ separator: '_' })
  .file('config.json');

export default nconf;
